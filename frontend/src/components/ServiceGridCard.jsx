import { motion } from 'framer-motion';
import BeforeAfter from './BeforeAfter';

export default function ServiceGridCard({ service, showBeforeAfter, index }) {
  return (
    <motion.article
      className="svc-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
      whileHover={{ y: -8 }}
    >
      <div className="svc-card__media">
        {showBeforeAfter && service.before ? (
          <BeforeAfter before={service.before} after={service.after} compact />
        ) : (
          <img src={service.image} alt={service.title} loading="lazy" />
        )}
        <span className="svc-card__number">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="svc-card__body">
        <h3 className="svc-card__title">{service.title}</h3>
        <p className="svc-card__text">{service.text}</p>
      </div>
    </motion.article>
  );
}
