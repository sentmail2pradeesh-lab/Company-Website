import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { getBlogById } from '../data/blogs';
import { fadeUp, viewportOnce } from '../lib/motion';

export default function BlogDetail() {
  const { id } = useParams();
  const blog = getBlogById(id);
  const navigate = useNavigate();

  if (!blog) {
    return (
      <>
        <Navbar />
        <section className="pt-40 pb-24 text-center bg-cream">
          <h1 className="font-display text-3xl font-bold text-ink">Blog not found</h1>
          <p className="mt-3 text-mist">The article you're looking for doesn't exist.</p>
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
      <section className="relative pt-32 pb-10 lg:pt-40 bg-cream overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_15%,transparent_60%)]" />
        <div className="mx-auto max-w-3xl px-6">
          <Link to="/blogs" className="inline-flex items-center gap-1.5 text-sm font-medium text-mist hover:text-royal transition-colors">
            <Icon name="arrowRight" className="w-4 h-4 rotate-180" />
            Back to Blogs
          </Link>

          {blog.category && (
            <span className="mt-6 inline-flex items-center rounded-full border border-royal/15 bg-royal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-royal">
              {blog.category}
            </span>
          )}

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-4 font-display text-3xl md:text-5xl font-extrabold tracking-tight text-ink leading-[1.1]"
          >
            {blog.title}
          </motion.h1>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-royal to-sky text-white font-semibold text-sm">
              VE
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{blog.author}</p>
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
        className="mx-auto max-w-4xl px-6"
      >
        <div className="rounded-3xl overflow-hidden shadow-float border border-line aspect-[16/9]">
          <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      </motion.div>

      {/* Body */}
      <article className="py-12 lg:py-16 bg-cream">
        <div className="mx-auto max-w-3xl px-6">
          <div className="space-y-6">
            {blog.content.split('\n\n').map((para, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="text-base md:text-lg text-slate leading-relaxed"
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
            className="mt-12 rounded-3xl border border-line bg-white p-8 text-center shadow-card"
          >
            <h3 className="font-display text-xl md:text-2xl font-bold text-ink">Need help with your next project?</h3>
            <p className="mt-2 text-mist">Our team is ready to bring your vision to life.</p>
            <div className="mt-5">
              <Button iconRight="arrowRight" onClick={() => navigate('/contact')}>Get a Free Quote</Button>
            </div>
          </motion.div>
        </div>
      </article>

      <Footer />
    </>
  );
}
