import { motion } from 'framer-motion';
import SectionHeading from './ui/SectionHeading';
import Icon from './ui/Icon';
import { WHY_VISTA } from '../lib/data';
import { fadeUp, staggerContainer, viewportOnce } from '../lib/motion';

const ACCENT_BG = {
  royal: 'bg-royal-50 text-royal',
  sky: 'bg-sky-soft text-sky',
  emerald: 'bg-emerald-soft text-emerald',
};

function Tile({ item, large }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-3xl border border-line bg-white p-6 md:p-7 shadow-card hover:shadow-float transition-shadow ${
        large ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      {/* Decorative gradient corner */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-sky-soft to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${ACCENT_BG[item.accent]}`}>
          <Icon name={item.icon} className="w-6 h-6" />
        </span>
        <h3 className={`mt-5 font-bold font-display text-ink tracking-tight ${large ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
          {item.title}
        </h3>
        <p className={`mt-2 text-mist leading-relaxed ${large ? 'text-base max-w-md' : 'text-sm'}`}>
          {item.desc}
        </p>

        {large && (
          <div className="mt-6 flex items-end gap-6">
            <div>
              <p className="font-display text-4xl md:text-5xl font-extrabold text-gradient-brand">10+</p>
              <p className="text-xs text-mist mt-1">years of craft</p>
            </div>
            <div>
              <p className="font-display text-4xl md:text-5xl font-extrabold text-gradient-emerald">2M+</p>
              <p className="text-xs text-mist mt-1">images edited</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function WhyVista() {
  return (
    <section id="why" className="py-20 lg:py-32 bg-cloud">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="Why Vista Edits"
          badgeAccent="emerald"
          title="A partner that feels like an in-house team."
          titleHighlight="in-house team."
          subtitle="Premium craft, dependable delivery, and people who genuinely care about your brand's outcome."
        />

        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-5 md:grid-cols-3 lg:grid-cols-4 auto-rows-[1fr]"
        >
          {WHY_VISTA.map((item) => (
            <Tile key={item.title} item={item} large={item.span === 'lg'} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
