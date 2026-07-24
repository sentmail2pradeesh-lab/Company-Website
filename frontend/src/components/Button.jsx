import { motion } from 'framer-motion';

const variants = {
  primary: {
    base: 'btn btn--primary',
    whileHover: { scale: 1.04, backgroundColor: '#a01818' },
    whileTap: { scale: 0.97 },
  },
  ghost: {
    base: 'btn btn--ghost',
    whileHover: { scale: 1.04, backgroundColor: 'rgba(255,255,255,0.12)' },
    whileTap: { scale: 0.97 },
  },
  outline: {
    base: 'btn btn--outline',
    whileHover: { scale: 1.03, backgroundColor: 'rgba(196, 30, 30, 0.08)' },
    whileTap: { scale: 0.97 },
  },
  light: {
    base: 'btn btn--light',
    whileHover: { scale: 1.04, backgroundColor: '#f5f5f5', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' },
    whileTap: { scale: 0.97 },
  },
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  onClick,
  disabled,
}) {
  const config = variants[variant] || variants.primary;

  return (
    <motion.button
      type={type}
      className={`${config.base} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : config.whileHover}
      whileTap={disabled ? undefined : config.whileTap}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  );
}
