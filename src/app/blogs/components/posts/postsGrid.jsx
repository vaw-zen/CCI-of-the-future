"use client";
import PostCard from "./postCard.jsx";
import PostCardSkeleton from "./postCardSkeleton.jsx";
import styles from './postsGrid.module.css';
import { useEffect, useRef, useState, useMemo } from 'react';
import { dimensionsStore } from '@/utils/store/store';



const PostsGrid = () => {
  const PAGE_SIZE = 6; // 3 desktop cols x 2 rows
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [postsPaging, setPostsPaging] = useState(null);
  const sentinelRef = useRef(null);

  const { isMobile, isTablet } = dimensionsStore();
  const columnCount = useMemo(() => (isMobile() ? 1 : isTablet() ? 2 : 3), [isMobile, isTablet]);
  const initialSkeletonCount = columnCount; // 3/2/1
  const loadingMoreSkeletonCount = columnCount; // append 3/2/1 while fetching

  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await fetch(`/api/social/facebook?posts_limit=${PAGE_SIZE}`);
        const data = await res.json();
        setPosts(data.posts || []);
        setPostsPaging(data.posts_paging || null);
      } catch (error) {
        console.error("Error loading posts:", error);
        setPosts([]);
        setPostsPaging(null);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  const hasMore = !!postsPaging?.next;

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    const after = postsPaging?.cursors?.after || null;
    if (!after) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/social/facebook?posts_limit=${PAGE_SIZE}&posts_after=${encodeURIComponent(after)}`);
      const data = await res.json();
      setPosts(prev => ([...(prev || []), ...((data.posts) || [])]));
      setPostsPaging(data.posts_paging || null);
    } catch (e) {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (!hasMore) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        // Small timeout to avoid jank when quickly scrolling
        setTimeout(() => loadMore(), 0);
      }
    }, {
      root: null,
      rootMargin: '200px 0px 400px 0px',
      threshold: 0.01,
    });
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [sentinelRef, hasMore, postsPaging, loadingMore]);

  return (
    <section className={styles['posts-section']}>
      <div className={styles['posts-container']}>
        <div className={styles['posts-header']}>
          <h2 className={styles['posts-title']}>Dernières publications</h2>
          <p className={styles['posts-subtitle']}>
            Une sélection d'idées, d'expériences et de moments à partager
          </p>
        </div>

        <div className={styles['posts-grid']}>
          {loading ? (
            Array.from({ length: initialSkeletonCount }).map((_, index) => (
              <PostCardSkeleton className={styles['post-card-skeleton']} key={`skeleton-${index}`} />
            ))
          ) : (
            posts.length > 0 ? posts.map((post) => (
              <PostCard
                key={post.id}
                title={post.title}
                content={post.message}
                image={post.attachments}
                date={post.created_time}
                likes={post.likes}
                comments={post.comments}
                type={post.type}
                permalink_url={post.permalink_url}
                id={post.id}
              />
            )):
            <div className={styles['posts-grid-empty']}>
              <div className={styles['empty-illustration']}></div>
              <h3 className={styles['empty-title']}>Aucune publication trouvée</h3>
              <p className={styles['empty-subtitle']}>Revenez plus tard pour découvrir nos nouvelles publications.</p>
              <button className={styles['empty-action']} onClick={() => window.location.reload()}>Rafraîchir</button>
            </div>
          )}
          {loadingMore && Array.from({ length: loadingMoreSkeletonCount }).map((_, index) => (
            <PostCardSkeleton key={`more-skeleton-${index}`} />
          ))}
        </div>
        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} />
      </div>
    </section>
  );
};

export default PostsGrid;