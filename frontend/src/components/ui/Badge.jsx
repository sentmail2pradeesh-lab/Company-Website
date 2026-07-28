import Icon from './Icon';

const ACCENTS = {
  royal: 'bg-royal-50 text-royal border-royal/15',
  sky: 'bg-sky-soft text-royal border-sky/25',
  emerald: 'bg-emerald-soft text-emerald border-emerald/25',
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
