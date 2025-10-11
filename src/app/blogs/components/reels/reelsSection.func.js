import { useEffect, useRef, useState } from 'react'

export function useReelsSection(initialReels = null, initialReelsPaging = null) {
  const PAGE_SIZE = 4
  const [reels, setReels] = useState(initialReels || [])
  const [loading, setLoading] = useState(!initialReels)
  const [reelsPaging, setReelsPaging] = useState(initialReelsPaging)
  const [loadingMore, setLoadingMore] = useState(false)
  
  // In-memory cache for paginated results
  const cacheRef = useRef({})

  const initialSkeletonCount = PAGE_SIZE
  const loadingMoreSkeletonCount = PAGE_SIZE

  useEffect(() => {
    // Skip initial fetch if we already have data from server
    if (initialReels && initialReels.length > 0) {
      // We already have the paging data from initialReelsPaging
      return;
    }

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
  }, [initialReels])

  const loadMore = async () => {
    if (loadingMore) return
    if (!reelsPaging?.next) return
    const after = reelsPaging?.cursors?.after || null
    if (!after) return
    
    // Check cache first
    if (cacheRef.current[after]) {
      console.log('[Reels] Loading from cache for cursor:', after)
      setReels(prev => ([...(prev || []), ...(cacheRef.current[after].reels || [])]))
      setReelsPaging(cacheRef.current[after].paging || null)
      return
    }
    
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/social/facebook?reels_limit=${PAGE_SIZE}&reels_after=${encodeURIComponent(after)}`)
      const data = await res.json()
      
      // Store in cache
      cacheRef.current[after] = {
        reels: data.reels || [],
        paging: data.reels_paging || null
      }
      
      setReels(prev => ([...(prev || []), ...((data.reels) || [])]))
      setReelsPaging(data.reels_paging || null)
    } catch (e) {
      console.error('[Reels] Error loading more:', e)
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
