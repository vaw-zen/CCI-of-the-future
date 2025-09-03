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
  // Sample data - replace with actual Facebook posts data
  // const posts = [
    //   {
      //     id: "1",
      //     title: "Beautiful Morning Coffee Setup",
      //     content: "Starting the day with the perfect coffee setup. There's something magical about that first sip of perfectly brewed coffee that sets the tone for an amazing day ahead.",
      //     image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&h=300&fit=crop",
      //     date: "2 days ago",
      //     likes: 42,
      //     comments: 8,
      //     type: "post"
  //   },
  //   {
  //     id: "2", 
  //     title: "Weekend Hiking Adventure",
  //     content: "Explored the most incredible trail today! The views were absolutely breathtaking and reminded me why I love spending time in nature. Can't wait for the next adventure!",
  //     image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=500&h=300&fit=crop",
  //     date: "1 week ago",
  //     likes: 89,
  //     comments: 15,
  //     type: "post"
  //   },
  //   {
  //     id: "3",
  //     title: "Homemade Pizza Success!",
  //     content: "Finally nailed the perfect pizza dough recipe! Spent the whole afternoon experimenting with different techniques and the results were incredible. Recipe in comments!",
  //     image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=300&fit=crop",
  //     date: "3 days ago",
  //     likes: 67,
  //     comments: 23,
  //     type: "reel"
  //   },
  //   {
  //     id: "4",
  //     title: "Sunset Photography Tips",
  //     content: "Sharing some of my favorite techniques for capturing stunning sunset photos. The golden hour really is magical for photography enthusiasts.",
  //     image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop",
  //     date: "5 days ago", 
  //     likes: 134,
  //     comments: 29,
  //     type: "post"
  //   },
  //   {
  //     id: "5",
  //     title: "Creative Art Session",
  //     content: "Spent the evening working on some new art pieces. There's something incredibly therapeutic about getting lost in the creative process.",
  //     image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop",
  //     date: "1 week ago",
  //     likes: 78,
  //     comments: 12,
  //     type: "reel"
  //   },
  //   {
  //     id: "6",
  //     title: "Tech Setup Upgrade",
  //     content: "Finally upgraded my workspace setup! The new monitor and lighting setup is already making such a difference in productivity and creativity.",
  //     image: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=500&h=300&fit=crop",
  //     date: "4 days ago",
  //     likes: 56,
  //     comments: 7,
  //     type: "post"
  //   }
  // ];

  return (
    <section className={styles['posts-section']}>
      <div className={styles['posts-container']}>
        <div className={styles['posts-header']}>
          <h2 className={styles['posts-title']}>Latest Posts</h2>
          <p className={styles['posts-subtitle']}>
            A collection of thoughts, experiences, and moments worth sharing
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
              />
            )):
            <div className={styles['posts-grid-empty']}>
              <p>No posts found</p>
            </div>
          )}
          
        </div>
      </div>
    </section>
  );
};

export default PostsGrid;