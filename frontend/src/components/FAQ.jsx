import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeading from './ui/SectionHeading';
import Icon from './ui/Icon';
import Button from './ui/Button';
import { FAQS } from '../lib/data';

function Item({ q, a, isOpen, onClick, index }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          <span className="font-display text-xs font-bold text-royal">{String(index + 1).padStart(2, '0')}</span>
          <span className="font-semibold font-display text-ink text-base">{q}</span>
        </span>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-royal-50 text-royal transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 pl-12 text-sm text-mist leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="py-20 lg:py-32 bg-cream">
      <div className="mx-auto max-w-7xl px-6 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* Left sticky */}
        <div className="lg:sticky lg:top-28 self-start">
          <SectionHeading
            badge="FAQ"
            badgeAccent="emerald"
            title="Questions, answered."
            titleHighlight="answered."
            subtitle="Everything you need to know about working with Vista Edits. Can't find what you're looking for?"
            align="left"
          />
          <div className="mt-6 hidden lg:block">
            <Button variant="outline" iconLeft="envelope" to="/contact">
              Contact our team
            </Button>
          </div>
        </div>

        {/* Right accordion */}
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <Item
              key={item.q}
              q={item.q}
              a={item.a}
              index={i}
              isOpen={open === i}
              onClick={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
