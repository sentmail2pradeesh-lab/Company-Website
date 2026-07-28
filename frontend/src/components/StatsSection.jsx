import { motion } from 'framer-motion';
import { useCountUp, fadeUp, viewportOnce } from '../lib/motion';
import Icon from './ui/Icon';

function Stat({ stat, index }) {
  const [ref, value] = useCountUp(stat.value, { duration: 2, decimals: stat.decimals || 0 });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      className="relative text-center"
    >
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 backdrop-blur-sm text-royal shadow-card border border-white">
        <Icon name={stat.icon} className="w-6 h-6" />
      </span>
      <div className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-ink">
        {value}
        <span className="text-gradient-brand">{stat.suffix}</span>
      </div>
      <p className="mt-2 text-sm md:text-base text-slate font-medium">{stat.label}</p>
    </motion.div>
  );
}

export default function StatsSection({ stats, intro, compact = false }) {
  const data = stats;

  return (
    <section className={compact ? 'py-0' : 'py-16 lg:py-24'}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-soft via-white to-emerald-soft border border-line px-6 py-12 md:px-12 md:py-16 shadow-card"
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 blob-royal opacity-60" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 blob-emerald opacity-60" />

          <div className="relative">
            {intro && (
              <motion.p
                variants={fadeUp}
                className="mx-auto mb-10 max-w-2xl text-center text-base md:text-lg text-slate"
              >
                {intro}
              </motion.p>
            )}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="grid grid-cols-2 gap-8 md:grid-cols-4"
            >
              {data.map((s, i) => (
                <Stat key={s.label} stat={s} index={i} />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
