import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Icon from './ui/Icon';
import StatsSection from './StatsSection';
import BeforeAfterSlider from './BeforeAfterSlider';
import { SERVICE_HIGHLIGHTS } from '../lib/data';
import { fadeUp, staggerContainer, viewportOnce } from '../lib/motion';

export default function ServicePageLayout({ data, showBeforeAfter = false }) {
  const navigate = useNavigate();
  const highlights = SERVICE_HIGHLIGHTS[data.slug] || [];

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-obsidian overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_75%)]" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] blob-royal opacity-50 -z-10 pointer-events-none" />
        <div className="absolute top-40 -left-32 w-[450px] h-[450px] blob-cyan opacity-40 -z-10 pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="flex items-center gap-2 text-xs font-semibold">
              <Link to="/" className="text-slate-400 hover:text-cyan-400 transition-colors">
                Home
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-cyan-400 font-bold">{data.title}</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="mt-5 font-display text-4xl md:text-6xl font-extrabold tracking-tight text-ink leading-[1.08]">
              {data.title}
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-3 text-xl font-display font-extrabold text-gradient-brand">
              {data.headline}
            </motion.p>
            <motion.p variants={fadeUp} className="mt-4 text-mist leading-relaxed max-w-lg font-normal">
              {data.description}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
              <Button variant="primary" iconRight="arrowRight" onClick={() => navigate('/contact')}>
                Get Started
              </Button>
              <Button variant="outline" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore Services
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative rounded-[2.5rem] overflow-hidden shadow-float border border-line glass-card bg-obsidian-card p-3"
          >
            {showBeforeAfter && data.services[0]?.before ? (
              <BeforeAfterSlider
                before={data.services[0].before}
                after={data.services[0].after}
                className="aspect-[5/4]"
                rounded="rounded-3xl"
              />
            ) : (
              <img src={data.heroImage} alt={data.title} className="w-full aspect-[5/4] object-cover rounded-3xl" loading="lazy" />
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <StatsSection
        stats={data.stats}
        compact
      />

      {/* Highlights grid */}
      {highlights.length > 0 && (
        <section id="services" className="py-20 lg:py-28 bg-gradient-to-b from-slate-50 via-indigo-50/30 to-slate-50 dark:from-obsidian dark:via-obsidian dark:to-obsidian relative overflow-hidden transition-colors">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-14">
              <Badge accent="emerald">Capabilities</Badge>
              <h2 className="mt-3 text-3xl font-extrabold font-display text-ink">What We Offer</h2>
            </div>
            <motion.div
              variants={staggerContainer(0.1)}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {highlights.map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  className="rounded-3xl border border-line bg-obsidian-card p-6 shadow-card glass-card-hover backdrop-blur-xl"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <Icon name={item.icon} className="w-6 h-6" />
                  </span>
                  <h3 className="text-lg font-bold font-display text-ink">{item.label}</h3>
                  <p className="mt-2 text-sm text-mist leading-relaxed font-normal">
                    Professional, high-precision {item.label.toLowerCase()} tailored to your brand standards.
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Detailed services rows */}
      <section className="py-24 lg:py-36 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-obsidian dark:to-obsidian transition-colors">
        <div className="mx-auto max-w-7xl px-6 space-y-24 lg:space-y-36">
          {data.services.map((svc, i) => (
            <motion.div
              key={svc.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className={`grid gap-10 lg:grid-cols-2 items-center ${svc.reverse ? 'lg:direction-rtl' : ''}`}
            >
              <div className={svc.reverse ? 'lg:order-2' : ''}>
                <span className="text-xs font-bold font-display text-cyan-500 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 font-display text-2xl md:text-3xl font-bold text-ink tracking-tight">
                  {svc.title}
                </h3>
                <p className="mt-3.5 text-mist leading-relaxed font-normal">{svc.text}</p>
              </div>

              <div className={`rounded-[2.5rem] overflow-hidden border border-white/15 shadow-float glass-card bg-slate-900/80 p-3 ${svc.reverse ? 'lg:order-1' : ''}`}>
                {showBeforeAfter && svc.before ? (
                  <BeforeAfterSlider
                    before={svc.before}
                    after={svc.after}
                    className="aspect-[5/4]"
                    rounded="rounded-3xl"
                  />
                ) : (
                  <img src={svc.image} alt={svc.title} className="w-full aspect-[5/4] object-cover rounded-3xl" loading="lazy" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="py-20 lg:py-28 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-900/90 via-slate-900 to-slate-950 p-10 md:p-16 text-center border border-white/15 shadow-float glass-card"
          >
            <div className="absolute -top-32 -right-32 w-80 h-80 blob-royal opacity-40 pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 blob-emerald opacity-40 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Ready to get started with {data.title.replace(' Services', '')}?
              </h2>
              <p className="mt-4 text-slate-300 max-w-2xl mx-auto text-base md:text-lg font-normal">
                Tell us about your project and our team will respond within 24 hours with a tailored proposal.
              </p>
              <div className="mt-10">
                <Button
                  variant="primary"
                  size="lg"
                  iconRight="arrowRight"
                  onClick={() => navigate('/contact')}
                >
                  Get a Free Quote
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
