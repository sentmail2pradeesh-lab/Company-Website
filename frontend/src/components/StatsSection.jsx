import { motion } from 'framer-motion';
import { useCountUp, fadeUp, staggerContainer, viewportOnce } from '../lib/motion';
import Icon from './ui/Icon';
import { STATS } from '../lib/data';

function Stat({ stat }) {
  const [ref, value] = useCountUp(stat.value, { duration: 2, decimals: stat.decimals || 0 });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      className="relative text-center"
    >
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.35)]">
        <Icon name={stat.icon} className="w-7 h-7" />
      </span>
      <div className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white">
        {value}
        <span className="text-gradient-brand">{stat.suffix}</span>
      </div>
      <p className="mt-2 text-sm md:text-base text-slate-300 font-bold">{stat.label}</p>
    </motion.div>
  );
}

export default function StatsSection({ stats = STATS, intro, compact = false }) {
  return (
    <section className={compact ? 'py-0' : 'py-20 lg:py-28 bg-gradient-to-b from-slate-50 to-sky-50/50 dark:from-obsidian dark:to-obsidian transition-colors'}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 px-6 py-12 md:px-14 md:py-16 shadow-2xl backdrop-blur-2xl"
        >
          <div className="absolute -top-24 -right-24 w-72 h-72 blob-royal opacity-50 pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 blob-emerald opacity-50 pointer-events-none" />

          <div className="relative z-10">
            {intro && (
              <motion.p
                variants={fadeUp}
                className="mx-auto mb-12 max-w-2xl text-center text-base md:text-lg text-slate-300 leading-relaxed font-normal"
              >
                {intro}
              </motion.p>
            )}
            <motion.div
              variants={staggerContainer(0.1)}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="grid grid-cols-2 gap-8 md:grid-cols-4"
            >
              {stats.map((s) => (
                <Stat key={s.label} stat={s} />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
