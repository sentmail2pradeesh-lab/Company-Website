import { motion } from 'framer-motion';

export default function BeforeAfter({ before, after }) {
  return (
    <div className="before-after">
      {[
        { src: before, label: 'Before' },
        { src: after, label: 'After' },
      ].map((item, i) => (
        <motion.div
          key={item.label}
          className="before-after__item"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        >
          <img src={item.src} alt={`${item.label} editing`} loading="lazy" />
          <span className="before-after__label">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
