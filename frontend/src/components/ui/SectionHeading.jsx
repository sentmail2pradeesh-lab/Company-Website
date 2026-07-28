import { motion } from 'framer-motion';
import { fadeUp, viewportOnce } from '../../lib/motion';
import Badge from './Badge';

export default function SectionHeading({
  badge,
  badgeAccent = 'royal',
  title,
  titleHighlight,
  subtitle,
  align = 'center',
  className = '',
}) {
  return (
    <motion.div
      className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : 'text-left'} ${className}`}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {badge && (
        <Badge accent={badgeAccent} className="mb-4">
          {badge}
        </Badge>
      )}
      {title && (
        <h2 className="text-3xl md:text-[2.8rem] lg:text-5xl font-bold tracking-tight leading-[1.08]">
          {titleHighlight ? (
            <>
              {title.split(titleHighlight)[0]}
              <span className="text-gradient-brand">{titleHighlight}</span>
              {title.split(titleHighlight)[1]}
            </>
          ) : (
            title
          )}
        </h2>
      )}
      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-mist leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
