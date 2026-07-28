import { motion } from 'framer-motion';
import { fadeUp, viewportOnce, fadeIn, scaleIn, slideInLeft, slideInRight } from '../../lib/motion';

const V = { fadeUp, fadeIn, scaleIn, slideInLeft, slideInRight };

export default function Reveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  className = '',
  viewport = viewportOnce,
}) {
  return (
    <motion.div
      className={className}
      variants={V[variant]}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
