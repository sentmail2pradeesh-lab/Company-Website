import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function BlogCard({ blog, index = 0 }) {
  return (
    <motion.article
      className="blog-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="blog-card__image">
        <img
          src={
            blog.image_url ||
            'https://images.unsplash.com/photo-1499750310107-5fef28fd660a?w=600&q=80'
          }
          alt={blog.title}
          loading="lazy"
        />
      </div>
      <div className="blog-card__body">
        <time className="blog-card__date">
          {new Date(blog.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <h3 className="blog-card__title">{blog.title}</h3>
        <p className="blog-card__excerpt">{blog.excerpt}</p>
        <Link to={`/blogs/${blog.id}`} className="btn btn--outline blog-card__btn">
          View More
        </Link>
      </div>
    </motion.article>
  );
}
