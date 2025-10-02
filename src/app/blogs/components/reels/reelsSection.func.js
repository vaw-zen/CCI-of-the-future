import { useEffect, useRef, useState } from 'react'

export function useReelsSection() {
  const PAGE_SIZE = 4
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
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

  return {
    // state
    reels,
    loading,
    reelsPaging,
    loadingMore,
    initialSkeletonCount,
    loadingMoreSkeletonCount,
    // actions
    loadMore,
    pageSize: PAGE_SIZE,
  }
}
