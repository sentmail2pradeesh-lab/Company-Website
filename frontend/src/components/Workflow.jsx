import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SectionHeading from './ui/SectionHeading';
import Icon from './ui/Icon';
import { WORKFLOW } from '../lib/data';
import { fadeUp, staggerContainer, viewportOnce } from '../lib/motion';

export default function Workflow() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start center', 'end center'] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="py-24 lg:py-36 bg-obsidian relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-dots opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="How We Work"
          badgeAccent="sky"
          title="A clear path from idea to delivery."
          titleHighlight="idea to delivery."
          subtitle="No surprises, no guesswork — just a transparent, proven process refined over a decade."
        />

        <div ref={ref} className="mt-20 relative">
          {/* Desktop: horizontal connector */}
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-1 bg-line rounded-full overflow-hidden">
            <motion.div
              style={{ scaleX: lineScale, transformOrigin: 'left' }}
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
            />
          </div>

          <motion.div
            variants={staggerContainer(0.12)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="grid gap-8 lg:grid-cols-5"
          >
            {WORKFLOW.map((step) => (
              <motion.div key={step.step} variants={fadeUp} className="relative text-center lg:text-left group">
                {/* Number circle */}
                <div className="relative z-10 mx-auto lg:mx-0 flex h-20 w-20 items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-obsidian-card border border-line shadow-float glass-card group-hover:border-cyan-500/50 transition-all">
                    <span className="font-display text-xl font-extrabold text-gradient-brand">{step.step}</span>
                  </div>
                </div>

                <div className="mt-5 lg:px-2">
                  <div className="flex items-center gap-2.5 justify-center lg:justify-start">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      <Icon name={step.icon} className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold font-display text-ink text-lg">{step.title}</h3>
                  </div>
                  <p className="mt-3 text-sm text-mist leading-relaxed font-normal">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
