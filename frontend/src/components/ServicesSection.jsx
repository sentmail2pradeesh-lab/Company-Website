import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import SectionHeading from './ui/SectionHeading';
import Icon from './ui/Icon';
import BeforeAfterSlider from './BeforeAfterSlider';
import { fadeUp, viewportOnce } from '../lib/motion';
import { SERVICE_HIGHLIGHTS, VIDEO_TAGS, MARKETING_TAGS, STACK_BADGES } from '../lib/data';

/* ============ 01 — PHOTO: Bento layout ============ */
function PhotoService() {
  const highlights = SERVICE_HIGHLIGHTS['photo-editing'];
  return (
    <ServiceShell index="01" serviceName="Photo Editing" route="/photo-editing" variant={fadeUp}>
      <div className="grid gap-8 lg:grid-cols-2 items-center">
        <div className="rounded-[2.5rem] p-3 shadow-float border border-line glass-card">
          <BeforeAfterSlider
            before="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&q=80"
            after="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=80"
            className="aspect-[5/4]"
            rounded="rounded-3xl"
          />
          <div className="flex items-center gap-2.5 px-3 py-3">
            <Icon name="photo" className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-ink">Twilight conversion · HDR blend</span>
          </div>
        </div>

        <div>
          <h3 className="text-2xl md:text-3xl font-extrabold font-display text-ink tracking-tight">
            Every detail, pixel-perfect.
          </h3>
          <p className="mt-3 text-mist leading-relaxed font-normal">
            HDR blending, sky replacement, virtual staging and retouching for real estate, e-commerce and portrait work.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {highlights.map((h) => (
              <div
                key={h.label}
                className="group flex items-center gap-3 rounded-2xl border border-line bg-slate-500/5 p-3 transition-all hover:border-cyan-500/40 hover:bg-slate-500/10"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                  <Icon name={h.icon} className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-ink">{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ServiceShell>
  );
}

/* ============ 02 — VIDEO: timeline layout ============ */
function VideoService() {
  return (
    <ServiceShell index="02" serviceName="Video Editing" route="/video-editing" variant={fadeUp} reverse>
      <div className="grid gap-8 lg:grid-cols-2 items-center">
        <div className="order-2 lg:order-1">
          <h3 className="text-2xl md:text-3xl font-extrabold font-display text-ink tracking-tight">
            Cinematic stories for every screen.
          </h3>
          <p className="mt-3 text-mist leading-relaxed font-normal">
            Color grading, motion graphics, reels and corporate films engineered to captivate and convert.
          </p>

          <div className="mt-6 rounded-3xl bg-obsidian-card p-4 shadow-float border border-line glass-card">
            <div className="flex gap-1.5 mb-3">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="h-1.5 flex-1 rounded-full bg-slate-500/20" />
              ))}
            </div>
            <div className="flex gap-2 overflow-hidden py-1">
              {VIDEO_TAGS.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={viewportOnce}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 text-xs font-bold text-cyan-400 whitespace-nowrap"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
            <div className="flex gap-1.5 mt-3">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="h-1.5 flex-1 rounded-full bg-slate-500/20" />
              ))}
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 relative rounded-[2.5rem] overflow-hidden shadow-float border border-line aspect-video bg-obsidian-card">
          <img
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80"
            alt="Video editing preview"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white shadow-glow border border-white/30"
            aria-label="Play preview"
          >
            <Icon name="play" className="w-6 h-6 ml-0.5" />
          </motion.button>
          <div className="absolute bottom-4 left-5 right-5 flex items-center gap-3">
            <span className="text-xs font-bold text-white font-mono">1:24</span>
            <div className="relative h-1.5 flex-1 rounded-full bg-white/20 backdrop-blur-md">
              <div className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" />
              <span className="absolute top-1/2 left-2/5 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-glow" />
            </div>
            <span className="text-xs font-bold text-white font-mono">3:48</span>
          </div>
        </div>
      </div>
    </ServiceShell>
  );
}

/* ============ 03 — SOFTWARE: code layout ============ */
function SoftwareService() {
  return (
    <ServiceShell index="03" serviceName="Software Development" route="/software-development" variant={fadeUp}>
      <div className="grid gap-8 lg:grid-cols-2 items-center">
        <div className="rounded-[2.5rem] overflow-hidden shadow-float border border-line bg-slate-950 text-slate-100">
          <div className="flex items-center gap-2 border-b border-line px-5 py-3.5 bg-slate-500/10">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-3 text-xs font-mono text-mist">app.tsx</span>
          </div>
          <pre className="p-6 text-sm font-mono leading-relaxed overflow-x-auto text-slate-100">
            <code>
              <span className="text-cyan-400">const</span> <span className="text-emerald-400">product</span> <span className="text-mist">=</span> {'{\n'}
              <span className="text-cyan-400">  name</span>: <span className="text-indigo-400">'Vista Edits'</span>,{'\n'}
              <span className="text-cyan-400">  stack</span>: [<span className="text-emerald-400">'React'</span>, <span className="text-emerald-400">'Node'</span>, <span className="text-emerald-400">'AWS'</span>],{'\n'}
              <span className="text-cyan-400">  scale</span>: <span className="text-indigo-400">∞</span>,{'\n'}
              <span className="text-cyan-400">  ship</span>: <span className="text-cyan-400">() =&gt;</span> <span className="text-emerald-400">'premium'</span>,{'\n'}
              {'};'}
            </code>
          </pre>
        </div>

        <div>
          <h3 className="text-2xl md:text-3xl font-extrabold font-display text-ink tracking-tight">
            Products built to scale.
          </h3>
          <p className="mt-3 text-mist leading-relaxed font-normal">
            Web platforms, mobile apps, cloud architecture and AI solutions with elegant, accessible UX.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {STACK_BADGES.map((b, i) => (
              <motion.span
                key={b}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ delay: i * 0.05 }}
                className="rounded-full border border-line bg-slate-500/5 px-4 py-1.5 text-xs font-bold text-ink hover:border-emerald-500/40 hover:text-emerald-400 transition-all cursor-default"
              >
                {b}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </ServiceShell>
  );
}

/* ============ 04 — MARKETING: analytics dashboard ============ */
function MarketingService() {
  return (
    <ServiceShell index="04" serviceName="Digital Marketing" route="/digital-marketing" variant={fadeUp} reverse>
      <div className="grid gap-8 lg:grid-cols-2 items-center">
        <div className="order-2 lg:order-1">
          <h3 className="text-2xl md:text-3xl font-extrabold font-display text-ink tracking-tight">
            Growth, measured and multiplied.
          </h3>
          <p className="mt-3 text-mist leading-relaxed font-normal">
            SEO, paid media, social and content strategy that puts your brand in front of the right people.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {MARKETING_TAGS.map((t) => (
              <span key={t} className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 text-xs font-bold text-cyan-400">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2 rounded-[2.5rem] p-6 shadow-float border border-line glass-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-mist font-bold uppercase tracking-wider">Campaign performance</p>
              <p className="text-2xl font-extrabold font-display text-ink mt-1">$48,920</p>
            </div>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">+128%</span>
          </div>
          <div className="flex items-end gap-2.5 h-36 mb-5 pt-2">
            {[40, 55, 48, 72, 65, 88, 95].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={viewportOnce}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="flex-1 rounded-t-xl bg-gradient-to-t from-cyan-500/30 via-cyan-400 to-indigo-500"
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'CTR', value: '8.4%' },
              { label: 'Leads', value: '1.2K' },
              { label: 'ROAS', value: '4.8x' },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl border border-line bg-slate-500/5 p-3 text-center">
                <p className="text-base font-extrabold text-ink">{k.value}</p>
                <p className="text-[0.7rem] text-mist font-bold mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ServiceShell>
  );
}

/* ============ Shared Shell ============ */
function ServiceShell({ index, serviceName, route, variant, children }) {
  return (
    <motion.div
      variants={variant}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="relative will-change-transform"
    >
      <span className="pointer-events-none absolute -top-12 right-0 font-display text-[8rem] md:text-[12rem] font-extrabold leading-none opacity-5 select-none -z-10 text-ink">
        {index}
      </span>

      <div className="mb-6 flex items-center gap-3">
        <span className="font-display text-sm font-bold text-cyan-400">{index}</span>
        <span className="h-px flex-1 max-w-[60px] bg-line" />
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-mist">{serviceName}</span>
      </div>

      {children}

      <Link
        to={route}
        className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300 hover:gap-3 transition-all"
      >
        Explore {serviceName}
        <Icon name="arrowRight" className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

const TABS = [
  { id: 'all', label: 'All Services' },
  { id: 'photo', label: 'Photo Editing' },
  { id: 'video', label: 'Video Editing' },
  { id: 'software', label: 'Software Dev' },
  { id: 'marketing', label: 'Digital Marketing' },
];

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <section id="services" className="py-24 lg:py-36 bg-gradient-to-b from-slate-50 via-indigo-50/50 to-slate-50 dark:from-obsidian dark:via-obsidian dark:to-obsidian relative overflow-hidden transition-colors">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="What We Do"
          badgeAccent="sky"
          title="Four crafts, one creative partner."
          titleHighlight="one creative partner."
          subtitle="Each discipline is its own world — staffed by specialists, delivered with a premium, dependable pipeline."
        />

        {/* Filter Tabs */}
        <div className="mt-12 flex items-center justify-center gap-2.5 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white border-transparent shadow-glow scale-105'
                  : 'bg-slate-500/10 text-mist border-line hover:text-ink hover:bg-slate-500/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tabbed Content */}
        <div className="mt-16 lg:mt-24">
          <AnimatePresence mode="wait">
            {activeTab === 'all' && (
              <motion.div key="all" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-28 lg:space-y-36">
                <PhotoService />
                <VideoService />
                <SoftwareService />
                <MarketingService />
              </motion.div>
            )}
            {activeTab === 'photo' && (
              <motion.div key="photo" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <PhotoService />
              </motion.div>
            )}
            {activeTab === 'video' && (
              <motion.div key="video" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <VideoService />
              </motion.div>
            )}
            {activeTab === 'software' && (
              <motion.div key="software" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <SoftwareService />
              </motion.div>
            )}
            {activeTab === 'marketing' && (
              <motion.div key="marketing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <MarketingService />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
