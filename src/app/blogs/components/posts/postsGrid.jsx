"use client";
import PostCard from "./postCard.jsx";
import PostCardSkeleton from "./postCardSkeleton.jsx";
import styles from './postsGrid.module.css';
import { useEffect, useState } from 'react';



const PostsGrid = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch('/api/social/facebook');
        const data = await res.json();
        // Here you can directly use normalized posts
        console.log("Facebook posts data:", data); // Debugging line to check the fetched data
        setPosts(data.posts || []);
      } catch (error) {
        console.error("Error loading posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

 


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
            // Show 4 skeleton cards while loading
            Array.from({ length: 6 }).map((_, index) => (
              <PostCardSkeleton key={`skeleton-${index}`} />
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
          
        </div>
      </div>
    </section>
  );
};

export default PostsGrid;