import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getBlogById } from '../data/blogs';

export default function BlogDetail() {
  const { id } = useParams();
  const blog = getBlogById(id);

  if (!blog) {
    return (
      <div className="page">
        <Navbar />
        <div className="blog-detail blog-detail--missing">
          <h1>Blog not found</h1>
          <Link to="/blogs" className="blog-detail__back">
            ← Back to Blogs
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />
      <motion.article
        className="blog-detail"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/blogs" className="blog-detail__back">
          ← Back to Blogs
        </Link>

        <div className="blog-detail__hero">
          <img src={blog.image_url} alt={blog.title} />
        </div>

        <div className="blog-detail__meta">
          <time>
            {new Date(blog.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span>{blog.author}</span>
        </div>

        <h1 className="blog-detail__title">{blog.title}</h1>

        <div className="blog-detail__content">
          {blog.content.split('\n\n').map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </motion.article>
      <Footer />
    </div>
  );
}
