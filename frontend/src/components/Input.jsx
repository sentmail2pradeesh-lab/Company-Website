import Icon from './ui/Icon';

export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-bold text-mist uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={[
          'w-full rounded-2xl border bg-obsidian-card px-4 py-3.5 text-sm text-ink placeholder:text-mist',
          'transition-all duration-200 outline-none',
          'focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20',
          error ? 'border-red-400' : 'border-line hover:border-slate-500/30',
        ].join(' ')}
      />
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400 mt-0.5 font-bold">
          <Icon name="close" className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
