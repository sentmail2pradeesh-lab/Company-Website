import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import api from '../api/axios';
import { getBlogById } from '../data/blogs';
import { fadeUp, viewportOnce } from '../lib/motion';

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(() => getBlogById(id));
  const [loading, setLoading] = useState(!blog);
  const navigate = useNavigate();

  useEffect(() => {
    const local = getBlogById(id);
    if (local) {
      setBlog(local);
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get(`/blogs/${id}`)
      .then((res) => {
        if (res.data?.blog) {
          setBlog({
            ...res.data.blog,
            author: res.data.blog.author || 'Vista Editz Team',
            category: res.data.blog.category || 'Insights',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <section className="pt-40 pb-24 text-center bg-obsidian">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Loading article...</p>
        </section>
        <Footer />
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Navbar />
        <section className="pt-40 pb-24 text-center bg-obsidian">
          <h1 className="font-display text-3xl font-bold text-white">Blog not found</h1>
          <p className="mt-3 text-slate-400">The article you're looking for doesn't exist.</p>
          <div className="mt-6">
            <Button to="/blogs" variant="outline" iconLeft="arrowRight">Back to Blogs</Button>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-12 lg:pt-44 bg-obsidian overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_75%)]" />
        <div className="mx-auto max-w-3xl px-6">
          <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-mist hover:text-cyan-400 transition-colors">
            <Icon name="arrowRight" className="w-4 h-4 rotate-180" />
            Back to Blogs
          </Link>

          {blog.category && (
            <span className="mt-6 inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 backdrop-blur-md">
              {blog.category}
            </span>
          )}

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-5 font-display text-3xl md:text-5xl font-extrabold tracking-tight text-ink leading-[1.1]"
          >
            {blog.title}
          </motion.h1>

          <div className="mt-6 flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white font-extrabold text-sm shadow-glow">
              VE
            </div>
            <div>
              <p className="text-sm font-bold text-ink">{blog.author}</p>
              <p className="text-xs text-mist">
                {new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cover image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mx-auto max-w-4xl px-6 my-8"
      >
        <div className="rounded-[2.5rem] overflow-hidden shadow-float border border-line aspect-[16/9] glass-card p-2 bg-obsidian-card">
          <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover rounded-[2rem]" />
        </div>
      </motion.div>

      {/* Body */}
      <article className="py-12 lg:py-20 bg-obsidian">
        <div className="mx-auto max-w-3xl px-6">
          <div className="space-y-6">
            {blog.content.split('\n\n').map((para, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="text-base md:text-lg text-mist leading-relaxed font-normal"
              >
                {para}
              </motion.p>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-16 rounded-[2.5rem] border border-line bg-obsidian-card p-8 md:p-12 text-center shadow-float glass-card backdrop-blur-2xl"
          >
            <h3 className="font-display text-2xl md:text-3xl font-extrabold text-ink">Need help with your next project?</h3>
            <p className="mt-3 text-mist font-normal">Our team is ready to bring your vision to life.</p>
            <div className="mt-8">
              <Button variant="primary" iconRight="arrowRight" onClick={() => navigate('/contact')}>Get a Free Quote</Button>
            </div>
          </motion.div>
        </div>
      </article>

      <Footer />
    </>
  );
}
