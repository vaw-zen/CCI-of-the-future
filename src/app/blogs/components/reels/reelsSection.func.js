import { useEffect, useRef, useState } from 'react'

export function useReelsSection() {
  const PAGE_SIZE = 4
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeReelId, setActiveReelId] = useState(null)
  const videoRefs = useRef({})
  const [playingIds, setPlayingIds] = useState(() => new Set())
  const lastToggleAtRef = useRef(0)
  const [reelsPaging, setReelsPaging] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)

  const initialSkeletonCount = PAGE_SIZE
  const loadingMoreSkeletonCount = PAGE_SIZE

  useEffect(() => {
    async function loadReels() {
      try {
        const res = await fetch(`/api/social/facebook?reels_limit=${PAGE_SIZE}`)
        const data = await res.json()
        setReels(data.reels || [])
        setReelsPaging(data.reels_paging || null)
      } catch (error) {
        console.error('Error loading reels:', error)
        setReels([])
        setReelsPaging(null)
      } finally {
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      }
    }
    loadReels()
  }, [])

  const loadMore = async () => {
    if (loadingMore) return
    if (!reelsPaging?.next) return
    const after = reelsPaging?.cursors?.after || null
    if (!after) return
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/social/facebook?reels_limit=${PAGE_SIZE}&reels_after=${encodeURIComponent(after)}`)
      const data = await res.json()
      setReels(prev => ([...(prev || []), ...((data.reels) || [])]))
      setReelsPaging(data.reels_paging || null)
    } catch (e) {
      // ignore
    } finally {
      setLoadingMore(false)
    }
  }

  const handlePlay = async (id) => {
    const targetVideo = videoRefs.current[id]

    Object.values(videoRefs.current).forEach(v => {
      if (!v || v === targetVideo) return
      try { v.pause() } catch (_) {}
      try { v.removeAttribute('src'); v.load() } catch (_) {}
    })

    if (targetVideo) {
      if (!targetVideo.getAttribute('src')) {
        const dataSrc = targetVideo.getAttribute('data-src')
        if (dataSrc) targetVideo.setAttribute('src', dataSrc)
      }
      try { await targetVideo.play() } catch (_) {}
      setActiveReelId(id)
    }
  }

  const handleTogglePlay = async (id, e, source) => {
    if (e) { e.preventDefault(); e.stopPropagation() }
    if (source === 'overlay') {
      const now = Date.now()
      if (now - lastToggleAtRef.current < 400) return
    }
    lastToggleAtRef.current = Date.now()
    const video = videoRefs.current[id]
    if (!video) return
    if (video.paused) {
      await handlePlay(id)
    } else {
      try { video.pause() } catch (_) {}
    }
  }

  const videoEventHandlers = {
    onPlay: (id) => setPlayingIds(prev => { const next = new Set(prev); next.add(id); return next }),
    onPause: (id) => setPlayingIds(prev => { const next = new Set(prev); next.delete(id); return next }),
    onEnded: (id) => setPlayingIds(prev => { const next = new Set(prev); next.delete(id); return next }),
  }

  return {
    // state
    reels,
    loading,
    activeReelId,
    videoRefs,
    playingIds,
    reelsPaging,
    loadingMore,
    initialSkeletonCount,
    loadingMoreSkeletonCount,
    // actions
    loadMore,
    handlePlay,
    handleTogglePlay,
    videoEventHandlers,
    pageSize: PAGE_SIZE,
  }
}
