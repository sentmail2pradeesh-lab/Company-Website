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
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-20 bg-cream overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="show">
            <motion.div variants={fadeUp}>
              <Link to="/" className="text-xs font-medium text-mist hover:text-royal transition-colors">
                Home
              </Link>
              <span className="text-xs text-mist mx-2">/</span>
              <span className="text-xs font-medium text-royal">{data.title}</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="mt-4 font-display text-3xl md:text-5xl font-extrabold tracking-tight text-ink">
              {data.title}
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-2 text-lg md:text-xl font-display font-semibold text-gradient-brand">
              {data.headline}
            </motion.p>
            <motion.p variants={fadeUp} className="mt-4 text-mist leading-relaxed max-w-lg">
              {data.description}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Button iconRight="arrowRight" onClick={() => navigate('/contact')}>
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
            className="relative rounded-3xl overflow-hidden shadow-float border border-line"
          >
            {showBeforeAfter && data.services[0]?.before ? (
              <BeforeAfterSlider
                before={data.services[0].before}
                after={data.services[0].after}
                className="aspect-[5/4]"
              />
            ) : (
              <img src={data.heroImage} alt={data.title} className="w-full aspect-[5/4] object-cover" loading="lazy" />
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
        <section id="services" className="py-16 lg:py-20 bg-cloud">
          <div className="mx-auto max-w-7xl px-6">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="text-center font-display text-2xl md:text-3xl font-bold text-ink tracking-tight"
            >
              What we offer in {data.title.replace(' Services', '')}
            </motion.h2>
            <motion.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {highlights.map((h) => (
                <motion.div
                  key={h.label}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-card hover:shadow-float transition-shadow"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-royal-50 text-royal group-hover:scale-110 transition-transform">
                    <Icon name={h.icon} className="w-5 h-5" />
                  </span>
                  <span className="text-sm font-semibold text-ink">{h.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Detailed services rows */}
      <section className="py-16 lg:py-24 bg-cream">
        <div className="mx-auto max-w-7xl px-6 space-y-20 lg:space-y-28">
          {data.services.map((svc, i) => (
            <motion.div
              key={svc.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className={`grid gap-8 lg:grid-cols-2 items-center ${svc.reverse ? 'lg:direction-rtl' : ''}`}
            >
              <div className={svc.reverse ? 'lg:order-2' : ''}>
                <span className="text-xs font-bold font-display text-royal uppercase tracking-widest">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-display text-xl md:text-2xl font-bold text-ink tracking-tight">
                  {svc.title}
                </h3>
                <p className="mt-3 text-mist leading-relaxed">{svc.text}</p>
              </div>

              <div className={`rounded-2xl overflow-hidden border border-line shadow-card ${svc.reverse ? 'lg:order-1' : ''}`}>
                {showBeforeAfter && svc.before ? (
                  <BeforeAfterSlider
                    before={svc.before}
                    after={svc.after}
                    className="aspect-[5/4]"
                  />
                ) : (
                  <img src={svc.image} alt={svc.title} className="w-full aspect-[5/4] object-cover" loading="lazy" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="py-16 lg:py-24 bg-cloud">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-royal to-royal-500 p-8 md:p-14 text-center"
          >
            <h2 className="font-display text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              Ready to get started with {data.title.replace(' Services', '')}?
            </h2>
            <p className="mt-3 text-sky-100 max-w-2xl mx-auto">
              Tell us about your project and our team will respond within 24 hours with a tailored proposal.
            </p>
            <div className="mt-8">
              <Button
                variant="light"
                size="lg"
                iconRight="arrowRight"
                onClick={() => navigate('/contact')}
              >
                Get a Free Quote
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
