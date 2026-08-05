import Icon from './Icon';

const ACCENTS = {
  royal: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.2)]',
  sky: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)]',
};

export default function Badge({ children, icon, accent = 'royal', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${ACCENTS[accent]} ${className}`}
    >
      {icon && <Icon name={icon} className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}
