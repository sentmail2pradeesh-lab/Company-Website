import { motion } from 'framer-motion';
import BeforeAfter from './BeforeAfter';

export default function ServiceOfferings({ services, showBeforeAfter = false }) {
  return (
    <div className="offerings-grid">
      {services.map((service, i) => (
        <motion.article
          key={service.title}
          className="offering-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
          whileHover={{ y: -6 }}
        >
          <div className="offering-card__media">
            {showBeforeAfter && service.before ? (
              <BeforeAfter before={service.before} after={service.after} compact />
            ) : (
              <img src={service.image} alt={service.title} loading="lazy" />
            )}
          </div>
          <div className="offering-card__body">
            <span className="offering-card__index">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="offering-card__title">{service.title}</h3>
            <p className="offering-card__text">{service.text}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
