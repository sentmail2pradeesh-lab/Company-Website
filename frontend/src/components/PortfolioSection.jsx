import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import SectionHeading from './ui/SectionHeading';
import Icon from './ui/Icon';
import BeforeAfterSlider from './BeforeAfterSlider';
import { PORTFOLIO, PORTFOLIO_FILTERS } from '../lib/data';
import { fadeUp, viewportOnce } from '../lib/motion';

function Card({ item }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="break-inside-avoid mb-5 group relative overflow-hidden rounded-2xl border border-line bg-white shadow-card hover:shadow-float transition-shadow"
    >
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category chip */}
        <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-royal">
          {item.category}
        </span>

        {/* Video play badge */}
        {item.video && (
          <span className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-royal shadow-card">
            <Icon name="play" className="w-4 h-4" />
          </span>
        )}

        {/* Hover content */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="font-bold font-display text-white text-lg">{item.title}</h3>
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-100">
            View Project <Icon name="arrowUpRight" className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function PortfolioSection() {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? PORTFOLIO : PORTFOLIO.filter((p) => p.category === filter);
  const featured = PORTFOLIO.find((p) => p.featured);

  return (
    <section id="portfolio" className="py-20 lg:py-32 bg-cloud">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="Our Work"
          badgeAccent="royal"
          title="Craft that speaks for itself."
          titleHighlight="speaks for itself."
          subtitle="A glimpse of the photo, video, software and marketing work we deliver for brands worldwide."
        />

        {/* Filters */}
        <LayoutGroup>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-10 flex flex-wrap justify-center gap-2"
          >
            {PORTFOLIO_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  filter === f ? 'text-white' : 'text-slate hover:text-royal'
                }`}
              >
                {filter === f && (
                  <motion.span
                    layoutId="portfolio-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-royal to-royal-500 shadow-card"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{f}</span>
              </button>
            ))}
          </motion.div>
        </LayoutGroup>

        {/* Featured before/after */}
        {filter === 'All' && featured && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-12 grid gap-6 lg:grid-cols-5 items-center rounded-3xl bg-white p-5 md:p-6 shadow-card border border-line"
          >
            <div className="lg:col-span-3">
              <BeforeAfterSlider
                before={featured.before}
                after={featured.after}
                className="aspect-[16/10]"
                rounded="rounded-2xl"
              />
            </div>
            <div className="lg:col-span-2 lg:pl-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald">
                Featured · Before / After
              </span>
              <h3 className="mt-4 text-2xl md:text-3xl font-bold font-display text-ink tracking-tight">
                {featured.title}
              </h3>
              <p className="mt-3 text-mist leading-relaxed">
                Drag the slider to see the transformation. Our real-estate retouching turns a flat daytime exterior into a warm, luxurious twilight scene — boosting listing engagement by up to 38%.
              </p>
              <div className="mt-5 flex items-center gap-6">
                <div>
                  <p className="font-display text-2xl font-extrabold text-gradient-brand">+38%</p>
                  <p className="text-xs text-mist">Click-through</p>
                </div>
                <div className="h-8 w-px bg-line" />
                <div>
                  <p className="font-display text-2xl font-extrabold text-gradient-emerald">24h</p>
                  <p className="text-xs text-mist">Delivery</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Masonry grid */}
        <motion.div layout className="mt-10 columns-1 sm:columns-2 lg:columns-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
