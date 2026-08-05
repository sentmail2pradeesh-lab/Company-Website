import { motion } from 'framer-motion';
import SectionHeading from './ui/SectionHeading';
import Icon from './ui/Icon';
import { WHY_VISTA } from '../lib/data';
import { fadeUp, staggerContainer, viewportOnce } from '../lib/motion';

const ACCENT_BG = {
  royal: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
  sky: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
  emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
};

function Tile({ item, large }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      className={`group relative overflow-hidden rounded-[2.5rem] border border-line bg-obsidian-card p-7 md:p-8 shadow-card glass-card-hover backdrop-blur-xl ${
        large ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      {/* Decorative gradient corner */}
      <div className="absolute -top-14 -right-14 w-44 h-44 rounded-full bg-gradient-to-br from-pink-500/25 via-purple-500/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl pointer-events-none" />

      <div className="relative z-10">
        <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${ACCENT_BG[item.accent]}`}>
          <Icon name={item.icon} className="w-7 h-7" />
        </span>
        <h3 className={`mt-6 font-extrabold font-display text-ink tracking-tight ${large ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          {item.title}
        </h3>
        <p className={`mt-3 text-mist leading-relaxed font-normal ${large ? 'text-base max-w-md' : 'text-sm'}`}>
          {item.desc}
        </p>

        {large && (
          <div className="mt-8 flex items-end gap-8 pt-4 border-t border-line">
            <div>
              <p className="font-display text-4xl md:text-5xl font-extrabold text-gradient-brand">10+</p>
              <p className="text-xs font-bold text-mist mt-1 uppercase tracking-wider">years of craft</p>
            </div>
            <div>
              <p className="font-display text-4xl md:text-5xl font-extrabold text-gradient-emerald">2M+</p>
              <p className="text-xs font-bold text-mist mt-1 uppercase tracking-wider">images edited</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function WhyVista() {
  return (
    <section id="why" className="py-24 lg:py-36 bg-gradient-to-b from-indigo-50/60 via-purple-50/30 to-slate-50 dark:from-obsidian dark:via-obsidian dark:to-obsidian relative overflow-hidden transition-colors">
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
          className="mt-16 grid gap-6 md:grid-cols-3 lg:grid-cols-4 auto-rows-[1fr]"
        >
          {WHY_VISTA.map((item) => (
            <Tile key={item.title} item={item} large={item.span === 'lg'} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
