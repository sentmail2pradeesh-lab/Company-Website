import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BlogCard from '../components/BlogCard';
import api from '../api/axios';

const fallbackBlogs = [
  {
    id: 1,
    title: 'The Future of AI in Photo Editing',
    excerpt: 'Discover how artificial intelligence is revolutionizing the way we edit and enhance images.',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80',
    created_at: '2025-07-15',
  },
  {
    id: 2,
    title: 'Video Editing Trends for 2025',
    excerpt: 'Stay ahead with the latest techniques and tools shaping professional video production.',
    image_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80',
    created_at: '2025-07-10',
  },
  {
    id: 3,
    title: 'Real Estate Photography Tips',
    excerpt: 'Learn how to capture stunning property photos that sell faster and at better prices.',
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80',
    created_at: '2025-07-05',
  },
];

export default function Blogs() {
  const [blogs, setBlogs] = useState(fallbackBlogs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/blogs')
      .then((res) => {
        if (res.data.blogs?.length) setBlogs(res.data.blogs);
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
