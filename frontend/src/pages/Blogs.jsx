import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BlogCard from '../components/BlogCard';
import api from '../api/axios';
import { blogPosts } from '../data/blogs';

export default function Blogs() {
  const [blogs, setBlogs] = useState(blogPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/blogs')
      .then((res) => {
        if (res.data.blogs?.length) {
          setBlogs(
            res.data.blogs.map((b) => ({
              ...b,
              content: blogPosts.find((p) => p.id === b.id)?.content || b.excerpt,
              author: 'ASZEN Editorial Team',
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <Navbar />
      <motion.h1
        className="page-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Blogs
      </motion.h1>

      <div className="section-container">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Loading blogs...</p>
        ) : (
          <div className="blogs-grid">
            {blogs.map((blog, i) => (
              <BlogCard key={blog.id} blog={blog} index={i} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
