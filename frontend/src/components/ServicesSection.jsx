import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SectionHeading from './ui/SectionHeading';
import Icon from './ui/Icon';
import BeforeAfterSlider from './BeforeAfterSlider';
import { fadeUp, viewportOnce, slideInLeft, slideInRight, Float } from '../lib/motion';
import { SERVICE_HIGHLIGHTS, VIDEO_TAGS, MARKETING_TAGS, STACK_BADGES } from '../lib/data';

/* ============ 01 — PHOTO: Bento / showcase layout ============ */
function PhotoService() {
  const highlights = SERVICE_HIGHLIGHTS['photo-editing'];
  return (
    <ServiceShell index="01" serviceName="Photo Editing" route="/photo-editing" variant={slideInLeft}>
      <div className="grid gap-6 lg:grid-cols-2 items-center">
        {/* Media card */}
        <div className="rounded-3xl bg-white p-3 shadow-float border border-line">
          <BeforeAfterSlider
            before="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&q=80"
            after="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=80"
            className="aspect-[5/4]"
          />
          <div className="flex items-center gap-2 px-2 py-2.5">
            <Icon name="photo" className="w-4 h-4 text-royal" />
            <span className="text-sm font-semibold text-ink">Twilight conversion · HDR blend</span>
          </div>
        </div>

        {/* Highlights bento */}
        <div>
          <h3 className="text-2xl md:text-3xl font-bold font-display text-ink tracking-tight">
            Every detail, pixel-perfect.
          </h3>
          <p className="mt-3 text-mist leading-relaxed">
            HDR blending, sky replacement, virtual staging and retouching for real estate, e-commerce and portrait work.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {highlights.map((h) => (
              <div
                key={h.label}
                className="group flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 transition-all hover:border-royal/30 hover:bg-royal-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-royal-50 text-royal group-hover:scale-110 transition-transform">
                  <Icon name={h.icon} className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-semibold text-ink">{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ServiceShell>
  );
}

/* ============ 02 — VIDEO: filmstrip timeline layout ============ */
function VideoService() {
  return (
    <ServiceShell index="02" serviceName="Video Editing" route="/video-editing" variant={slideInRight} reverse>
      <div className="grid gap-6 lg:grid-cols-2 items-center">
        <div className="order-2 lg:order-1">
          <h3 className="text-2xl md:text-3xl font-bold font-display text-ink tracking-tight">
            Cinematic stories for every screen.
          </h3>
          <p className="mt-3 text-mist leading-relaxed">
            Color grading, motion graphics, reels and corporate films engineered to captivate and convert.
          </p>

          {/* Filmstrip */}
          <div className="mt-5 rounded-2xl bg-ink p-3 shadow-float">
            <div className="flex gap-1.5 mb-2">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="h-1.5 flex-1 rounded-full bg-white/15" />
              ))}
            </div>
            <div className="flex gap-1.5 overflow-hidden">
              {VIDEO_TAGS.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={viewportOnce}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-md bg-white/10 px-2.5 py-1.5 text-[0.7rem] font-medium text-white whitespace-nowrap"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
            <div className="flex gap-1.5 mt-2">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="h-1.5 flex-1 rounded-full bg-white/15" />
              ))}
            </div>
          </div>
        </div>

        {/* Video player mockup */}
        <div className="order-1 lg:order-2 relative rounded-3xl overflow-hidden shadow-float border border-line aspect-video bg-cloud">
          <img
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80"
            alt="Video editing preview"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
          {/* Play button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-royal shadow-float"
            aria-label="Play preview"
          >
            <Icon name="play" className="w-6 h-6" />
          </motion.button>
          {/* Scrubber */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
            <span className="text-xs font-medium text-white/90">1:24</span>
            <div className="relative h-1 flex-1 rounded-full bg-white/25">
              <div className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-emerald" />
              <span className="absolute top-1/2 left-2/5 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow" />
            </div>
            <span className="text-xs font-medium text-white/90">3:48</span>
          </div>
        </div>
      </div>
    </ServiceShell>
  );
}

/* ============ 03 — SOFTWARE: code / terminal layout ============ */
function SoftwareService() {
  return (
    <ServiceShell index="03" serviceName="Software Development" route="/software-development" variant={slideInLeft}>
      <div className="grid gap-6 lg:grid-cols-2 items-center">
        {/* Code editor mockup */}
        <div className="rounded-3xl overflow-hidden shadow-float border border-line bg-white">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald" />
            <span className="ml-2 text-xs font-mono text-mist">app.tsx</span>
          </div>
          <pre className="p-5 text-[0.8rem] md:text-sm font-mono leading-relaxed overflow-x-auto bg-ink text-white/90">
            <code>
              <span className="text-sky">const</span> <span className="text-emerald">product</span> <span className="text-white/60">=</span> {'{'}
              {'\n  '}<span className="text-sky">name</span>: <span className="text-emerald">'Vista Edits'</span>,{'\n  '}
              <span className="text-sky">  stack</span>: [<span className="text-emerald">'React'</span>, <span className="text-emerald">'Node'</span>, <span className="text-emerald">'AWS'</span>],{'\n  '}
              <span className="text-sky">  scale</span>: <span className="text-sky-100">∞</span>,{'\n  '}
              <span className="text-sky">  ship</span>: <span className="text-sky">() =&gt;</span> <span className="text-emerald">'premium'</span>,{'\n'}
              {'};'}
            </code>
          </pre>
        </div>

        <div>
          <h3 className="text-2xl md:text-3xl font-bold font-display text-ink tracking-tight">
            Products built to scale.
          </h3>
          <p className="mt-3 text-mist leading-relaxed">
            Web platforms, mobile apps, cloud architecture and AI solutions with elegant, accessible UX.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {STACK_BADGES.map((b, i) => (
              <motion.span
                key={b}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ delay: i * 0.05 }}
                className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-semibold text-ink hover:border-emerald/40 hover:text-emerald transition-colors cursor-default"
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

/* ============ 04 — MARKETING: analytics dashboard layout ============ */
function MarketingService() {
  return (
    <ServiceShell index="04" serviceName="Digital Marketing" route="/digital-marketing" variant={slideInRight} reverse>
      <div className="grid gap-6 lg:grid-cols-2 items-center">
        <div className="order-2 lg:order-1">
          <h3 className="text-2xl md:text-3xl font-bold font-display text-ink tracking-tight">
            Growth, measured and multiplied.
          </h3>
          <p className="mt-3 text-mist leading-relaxed">
            SEO, paid media, social and content strategy that puts your brand in front of the right people.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {MARKETING_TAGS.map((t) => (
              <span key={t} className="rounded-full bg-sky-soft px-3.5 py-1.5 text-xs font-semibold text-royal">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="order-1 lg:order-2 rounded-3xl bg-white p-5 shadow-float border border-line">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-mist">Campaign performance</p>
              <p className="text-xl font-bold font-display text-ink">$48,920</p>
            </div>
            <span className="rounded-full bg-emerald-soft px-2.5 py-1 text-xs font-semibold text-emerald">+128%</span>
          </div>
          {/* Chart */}
          <div className="flex items-end gap-2 h-32 mb-4">
            {[40, 55, 48, 72, 65, 88, 95].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={viewportOnce}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="flex-1 rounded-t-lg bg-gradient-to-t from-sky/40 to-sky"
              />
            ))}
          </div>
          {/* KPI tiles */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'CTR', value: '8.4%' },
              { label: 'Leads', value: '1.2K' },
              { label: 'ROAS', value: '4.8x' },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-line bg-cream p-2.5 text-center">
                <p className="text-sm font-bold text-ink">{k.value}</p>
                <p className="text-[0.65rem] text-mist">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ServiceShell>
  );
}

/* ============ Shared shell for each service block ============ */
function ServiceShell({ index, serviceName, route, variant, reverse, children }) {
  return (
    <motion.div
      variants={variant}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="relative"
    >
      {/* Watermark number */}
      <span className="pointer-events-none absolute -top-8 right-0 font-display text-[7rem] md:text-[10rem] font-extrabold leading-none text-cloud select-none -z-10">
        {index}
      </span>

      <div className="mb-5 flex items-center gap-3">
        <span className="font-display text-sm font-bold text-royal">{index}</span>
        <span className="h-px flex-1 max-w-[60px] bg-line" />
        <span className="text-sm font-semibold uppercase tracking-[0.14em] text-mist">{serviceName}</span>
      </div>

      {children}

      <Link
        to={route}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:gap-2.5 transition-all"
      >
        Explore {serviceName}
        <Icon name="arrowRight" className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 lg:py-32 bg-cream relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="What We Do"
          badgeAccent="royal"
          title="Four crafts, one creative partner."
          titleHighlight="one creative partner."
          subtitle="Each discipline is its own world — staffed by specialists, delivered with a premium, dependable pipeline."
        />

        <div className="mt-16 lg:mt-24 space-y-24 lg:space-y-32">
          <PhotoService />
          <VideoService />
          <SoftwareService />
          <MarketingService />
        </div>
      </div>
    </section>
  );
}
