// import { useRef } from 'react';
// import { motion } from 'framer-motion';
// import { Link } from 'react-router-dom';
// import Icon from './Icon';

// const VARIANTS = {
//   primary:
//     'text-white bg-gradient-to-br from-emerald to-emerald-100 shadow-[0_8px_24px_rgba(16,185,129,0.28)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.36)]',
//   royal:
//     'text-white bg-gradient-to-br from-royal to-royal-500 shadow-[0_8px_24px_rgba(30,58,138,0.28)] hover:shadow-[0_12px_32px_rgba(30,58,138,0.36)]',
//   outline:
//     'text-royal bg-white/70 border border-line hover:border-royal/40 hover:bg-white',
//   ghost: 'text-ink hover:bg-cloud',
//   light: 'text-royal bg-white hover:bg-royal-50',
// };

// const SIZES = {
//   sm: 'px-4 py-2 text-sm',
//   md: 'px-6 py-3 text-[0.95rem]',
//   lg: 'px-8 py-4 text-base',
// };

// export default function Button({
//   children,
//   variant = 'primary',
//   size = 'md',
//   to,
//   href,
//   iconRight,
//   iconLeft,
//   magnetic = true,
//   className = '',
//   type = 'button',
//   onClick,
//   disabled,
// }) {
//   const ref = useRef(null);

//   const handleMove = (e) => {
//     if (!magnetic || disabled) return;
//     const el = ref.current;
//     if (!el) return;
//     const rect = el.getBoundingClientRect();
//     const x = e.clientX - rect.left - rect.width / 2;
//     const y = e.clientY - rect.top - rect.height / 2;
//     el.style.transform = `translate(${x * 0.12}px, ${y * 0.18}px)`;
//   };
//   const handleLeave = () => {
//     const el = ref.current;
//     if (el) el.style.transform = 'translate(0,0)';
//   };

//   const classes = `group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-300 will-change-transform ${VARIANTS[variant]} ${SIZES[size]} ${className} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`;

//   const inner = (
//     <>
//       {iconLeft && <Icon name={iconLeft} className="w-[1.1em] h-[1.1em]" />}
//       <span>{children}</span>
//       {iconRight && (
//         <Icon
//           name={iconRight}
//           className="w-[1.1em] h-[1.1em] transition-transform duration-300 group-hover:translate-x-0.5"
//         />
//       )}
//     </>
//   );

//   const sharedProps = {
//     ref,
//     className: classes,
//     onMouseMove: handleMove,
//     onMouseLeave: handleLeave,
//     onClick,
//     disabled,
//   };

//   if (to) {
//     return (
//       <Link to={to} {...sharedProps}>
//         {inner}
//       </Link>
//     );
//   }
//   if (href) {
//     return (
//       <a href={href} {...sharedProps}>
//         {inner}
//       </a>
//     );
//   }
//   return (
//     <motion.button
//       type={type}
//       whileTap={{ scale: disabled ? 1 : 0.97 }}
//       {...sharedProps}
//     >
//       {inner}
//     </motion.button>
//   );
// }
//Double color effect

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Icon from './Icon';

const VARIANTS = {
  primary:
    'text-white bg-emerald hover:bg-emerald/90 shadow-[0_8px_24px_rgba(16,185,129,0.28)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.36)]',
  royal:
    'text-white bg-gradient-to-br from-royal to-royal-500 shadow-[0_8px_24px_rgba(30,58,138,0.28)] hover:shadow-[0_12px_32px_rgba(30,58,138,0.36)]',
  outline:
    'text-royal bg-white/70 border border-line hover:border-royal/40 hover:bg-white',
  ghost: 'text-ink hover:bg-cloud',
  light: 'text-royal bg-white hover:bg-royal-50',
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
