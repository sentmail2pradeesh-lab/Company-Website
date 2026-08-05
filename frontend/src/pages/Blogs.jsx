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
              author: 'Vista Editz Team',
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

      <section className="relative pt-36 pb-16 lg:pt-44 lg:pb-24 bg-obsidian overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_75%)]" />
        <div className="absolute -top-32 right-0 w-[450px] h-[450px] blob-royal opacity-50 -z-10 pointer-events-none" />
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-400 backdrop-blur-md">
            Insights
          </span>
          <h1 className="mt-6 font-display text-4xl md:text-6xl font-extrabold tracking-tight text-ink leading-[1.08]">
            The <span className="text-gradient-brand">Vista Edits</span> Blog
          </h1>
          <p className="mt-4 text-mist text-lg leading-relaxed font-normal">
            Trends, tips and behind-the-scenes craft from our team of specialists.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-obsidian border-t border-line">
        <div className="mx-auto max-w-7xl px-6">
          {loading ? (
            <p className="text-center text-mist">Loading blogs…</p>
          ) : (
            <motion.div
              variants={staggerContainer(0.1)}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {blogs.map((blog) => (
                <motion.article
                  key={blog.id}
                  variants={fadeUp}
                  whileHover={{ y: -8 }}
                  className="group flex flex-col overflow-hidden rounded-[2.5rem] bg-obsidian-card border border-line shadow-float glass-card-hover backdrop-blur-xl"
                >
                  <Link to={`/blogs/${blog.id}`} className="relative overflow-hidden block aspect-[16/10]">
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />
                    {blog.category && (
                      <span className="absolute top-4 left-4 rounded-full bg-obsidian-card/90 backdrop-blur-md px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-cyan-400 border border-cyan-500/30">
                        {blog.category}
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <div className="flex items-center gap-2 text-xs font-semibold text-mist">
                      <Icon name="clock" className="w-3.5 h-3.5 text-cyan-400" />
                      {formatDate(blog.created_at)}
                    </div>
                    <h2 className="mt-3.5 font-bold font-display text-ink text-xl leading-snug tracking-tight line-clamp-2">
                      <Link to={`/blogs/${blog.id}`} className="hover:text-cyan-400 transition-colors">
                        {blog.title}
                      </Link>
                    </h2>
                    <p className="mt-2.5 text-sm text-mist leading-relaxed line-clamp-3 flex-1 font-normal">
                      {blog.excerpt}
                    </p>
                    <Link
                      to={`/blogs/${blog.id}`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 hover:gap-3 transition-all"
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
