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
    <section className="py-20 lg:py-32 bg-cream relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-dots opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          badge="How We Work"
          badgeAccent="sky"
          title="A clear path from idea to delivery."
          titleHighlight="idea to delivery."
          subtitle="No surprises, no guesswork — just a transparent, proven process refined over a decade."
        />

        <div ref={ref} className="mt-16 relative">
          {/* Desktop: horizontal connector */}
          <div className="hidden lg:block absolute top-9 left-[10%] right-[10%] h-0.5 bg-line">
            <motion.div
              style={{ scaleX: lineScale, transformOrigin: 'left' }}
              className="h-full bg-gradient-to-r from-royal to-emerald"
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
              <motion.div key={step.step} variants={fadeUp} className="relative text-center lg:text-left">
                {/* Number circle */}
                <div className="relative z-10 mx-auto lg:mx-0 flex h-18 w-18 lg:h-18 lg:w-18 items-center justify-center">
                  <div className="flex h-14 w-14 lg:h-18 lg:w-18 items-center justify-center rounded-2xl bg-white border border-line shadow-card">
                    <span className="font-display text-lg font-extrabold text-gradient-brand">{step.step}</span>
                  </div>
                </div>

                <div className="mt-4 lg:px-2">
                  <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-royal-50 text-royal">
                      <Icon name={step.icon} className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold font-display text-ink text-lg">{step.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-mist leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
