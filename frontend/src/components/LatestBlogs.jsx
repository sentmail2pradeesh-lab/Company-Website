import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionHeading from './ui/SectionHeading';
import Icon from './ui/Icon';
import { blogPosts } from '../data/blogs';
import { fadeUp, staggerContainer, viewportOnce } from '../lib/motion';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LatestBlogs() {
  const posts = blogPosts.slice(0, 3);

  return (
    <section className="py-24 lg:py-36 bg-gradient-to-b from-indigo-50/40 via-slate-50 to-slate-100/50 dark:from-obsidian dark:via-obsidian dark:to-obsidian relative overflow-hidden transition-colors">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeading
            badge="Insights"
            badgeAccent="royal"
            title="Ideas from the studio."
            titleHighlight="from the studio."
            subtitle="Trends, tips and behind-the-scenes craft from our team of specialists."
            align="left"
            className="md:max-w-xl"
          />
          <Link
            to="/blogs"
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-cyan-400 hover:text-indigo-700 dark:hover:text-cyan-300 hover:gap-3 transition-all whitespace-nowrap"
          >
            View all blogs
            <Icon name="arrowRight" className="w-4 h-4" />
          </Link>
        </div>

        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {posts.map((post) => (
            <motion.article
              key={post.id}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              className="group flex flex-col overflow-hidden rounded-[2.5rem] bg-obsidian-card border border-line shadow-float glass-card-hover backdrop-blur-xl"
            >
              <Link to={`/blogs/${post.id}`} className="relative overflow-hidden block aspect-[16/10]">
                <img
                  src={post.image_url}
                  alt={post.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <span className="absolute top-4 left-4 rounded-full bg-obsidian-card/90 backdrop-blur-md px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400 border border-indigo-500/20 dark:border-cyan-500/30">
                  {post.category}
                </span>
              </Link>

              <div className="flex flex-1 flex-col p-6 md:p-7">
                <div className="flex items-center gap-2 text-xs font-semibold text-mist">
                  <Icon name="clock" className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
                  {formatDate(post.created_at)}
                </div>
                <h3 className="mt-3.5 font-bold font-display text-ink text-xl leading-snug tracking-tight line-clamp-2">
                  <Link to={`/blogs/${post.id}`} className="hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors">
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2.5 text-sm text-mist leading-relaxed line-clamp-2 flex-1 font-normal">
                  {post.excerpt}
                </p>
                <Link
                  to={`/blogs/${post.id}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-cyan-400 hover:text-indigo-700 dark:hover:text-cyan-300 hover:gap-3 transition-all"
                >
                  Read more <Icon name="arrowRight" className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <div className="mt-12 text-center md:hidden">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-cyan-400"
          >
            View all blogs <Icon name="arrowRight" className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
