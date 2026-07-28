import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Icon from '../components/ui/Icon';
import api from '../api/axios';
import { blogPosts } from '../data/blogs';
import { fadeUp, staggerContainer, viewportOnce } from '../lib/motion';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

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
              author: 'Vista Edits Team',
              category: blogPosts.find((p) => p.id === b.id)?.category || 'Insights',
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />

      <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-16 bg-cream overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_15%,transparent_60%)]" />
        <div className="absolute -top-20 right-0 w-96 h-96 blob-royal -z-10" />
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-royal/15 bg-royal-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-royal">
            Insights
          </span>
          <h1 className="mt-5 font-display text-4xl md:text-6xl font-extrabold tracking-tight text-ink">
            The <span className="text-gradient-brand">Vista Edits</span> Blog
          </h1>
          <p className="mt-4 text-mist text-lg leading-relaxed">
            Trends, tips and behind-the-scenes craft from our team of specialists.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-cream">
        <div className="mx-auto max-w-7xl px-6">
          {loading ? (
            <p className="text-center text-mist">Loading blogs…</p>
          ) : (
            <motion.div
              variants={staggerContainer(0.1)}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {blogs.map((blog) => (
                <motion.article
                  key={blog.id}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-white border border-line shadow-card hover:shadow-float transition-shadow"
                >
                  <Link to={`/blogs/${blog.id}`} className="relative overflow-hidden block aspect-[16/10]">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {blog.category && (
                      <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-royal">
                        {blog.category}
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-xs text-mist">
                      <Icon name="clock" className="w-3.5 h-3.5" />
                      {formatDate(blog.created_at)}
                    </div>
                    <h2 className="mt-3 font-bold font-display text-ink text-lg leading-snug tracking-tight line-clamp-2">
                      <Link to={`/blogs/${blog.id}`} className="hover:text-royal transition-colors">
                        {blog.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-sm text-mist leading-relaxed line-clamp-3 flex-1">
                      {blog.excerpt}
                    </p>
                    <Link
                      to={`/blogs/${blog.id}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:gap-2.5 transition-all"
                    >
                      Read more <Icon name="arrowRight" className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
