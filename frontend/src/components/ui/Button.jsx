import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Icon from './Icon';

const VARIANTS = {
  primary:
    'text-white bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 hover:brightness-110 shadow-[0_0_28px_rgba(99,102,241,0.45)] hover:shadow-[0_0_36px_rgba(99,102,241,0.6)] border border-white/20',
  royal:
    'text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] border border-white/15',
  outline:
    'text-slate-800 dark:text-slate-200 bg-slate-500/10 dark:bg-white/5 border border-slate-300 dark:border-white/15 hover:border-indigo-500 dark:hover:border-indigo-400/50 hover:bg-indigo-500/10 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-white backdrop-blur-md shadow-card',
  ghost: 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-500/10',
  light: 'text-obsidian bg-white hover:bg-slate-100 shadow-glow font-bold',
};

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-[0.95rem]',
  lg: 'px-8 py-4 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  iconRight,
  iconLeft,
  magnetic = true,
  className = '',
  type = 'button',
  onClick,
  disabled,
}) {
  const ref = useRef(null);

  const handleMove = (e) => {
    if (!magnetic || disabled) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
  };
  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = 'translate(0,0)';
  };

  const classes = `group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-300 will-change-transform ${VARIANTS[variant]} ${SIZES[size]} ${className} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`;

  const inner = (
    <>
      {iconLeft && <Icon name={iconLeft} className="w-[1.1em] h-[1.1em]" />}
      <span>{children}</span>
      {iconRight && (
        <Icon
          name={iconRight}
          className="w-[1.1em] h-[1.1em] transition-transform duration-300 group-hover:translate-x-0.5"
        />
      )}
    </>
  );

  const sharedProps = {
    ref,
    className: classes,
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    onClick,
    disabled,
  };

  if (to) {
    return (
      <Link to={to} {...sharedProps}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} {...sharedProps}>
        {inner}
      </a>
    );
  }
  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      {...sharedProps}
    >
      {inner}
    </motion.button>
  );
}
