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
    <section className="py-20 lg:py-32 bg-cloud">
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
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:gap-2.5 transition-all whitespace-nowrap"
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
          className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {posts.map((post) => (
            <motion.article
              key={post.id}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="group flex flex-col overflow-hidden rounded-3xl bg-white border border-line shadow-card hover:shadow-float transition-shadow"
            >
              <Link to={`/blogs/${post.id}`} className="relative overflow-hidden block aspect-[16/10]">
                <img
                  src={post.image_url}
                  alt={post.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-royal">
                  {post.category}
                </span>
              </Link>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2 text-xs text-mist">
                  <Icon name="clock" className="w-3.5 h-3.5" />
                  {formatDate(post.created_at)}
                </div>
                <h3 className="mt-3 font-bold font-display text-ink text-lg leading-snug tracking-tight line-clamp-2">
                  <Link to={`/blogs/${post.id}`} className="hover:text-royal transition-colors">
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-mist leading-relaxed line-clamp-2 flex-1">
                  {post.excerpt}
                </p>
                <Link
                  to={`/blogs/${post.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:gap-2.5 transition-all"
                >
                  Read more <Icon name="arrowRight" className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <div className="mt-10 text-center md:hidden">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal"
          >
            View all blogs <Icon name="arrowRight" className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
