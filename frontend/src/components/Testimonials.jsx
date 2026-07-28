import SectionHeading from './ui/SectionHeading';
import Icon from './ui/Icon';
import { TESTIMONIALS } from '../lib/data';
import { fadeUp, viewportOnce } from '../lib/motion';
import { motion } from 'framer-motion';

function Stars({ n }) {
  return (
    <div className="flex items-center gap-0.5 text-emerald">
      {[...Array(n)].map((_, i) => (
        <Icon key={i} name="star" className="w-4 h-4" />
      ))}
    </div>
  );
}

function Card({ t }) {
  return (
    <figure className="relative w-[340px] md:w-[400px] shrink-0 mx-2.5 rounded-3xl bg-white border border-line p-6 shadow-card">
      <span className="absolute top-4 right-5 font-display text-6xl leading-none text-cloud select-none">”</span>
      <Stars n={t.rating} />
      <blockquote className="mt-3 text-sm md:text-[0.95rem] text-slate leading-relaxed relative z-10">
        “{t.quote}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <img src={t.avatar} alt={t.name} loading="lazy" className="h-11 w-11 rounded-full object-cover border border-line" />
        <div>
          <p className="text-sm font-semibold text-ink">{t.name}</p>
          <p className="text-xs text-mist">{t.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  const rowA = [...TESTIMONIALS, ...TESTIMONIALS];
  const rowB = [...TESTIMONIALS.slice().reverse(), ...TESTIMONIALS.slice().reverse()];

  return (
    <section className="py-20 lg:py-32 bg-cream relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="Testimonials"
          badgeAccent="emerald"
          title="Loved by brands and creators."
          titleHighlight="brands and creators."
          subtitle="Don't take our word for it — here's what our clients say about working with Vista Edits."
        />
      </div>

      <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce} className="mt-14 space-y-5">
        <div className="relative overflow-hidden mask-fade-x">
          <div className="flex w-max animate-marquee pause-on-hover">
            {rowA.map((t, i) => (
              <Card key={`a-${i}`} t={t} />
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden mask-fade-x">
          <div className="flex w-max animate-marquee-rev pause-on-hover">
            {rowB.map((t, i) => (
              <Card key={`b-${i}`} t={t} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
