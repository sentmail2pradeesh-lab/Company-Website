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
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-ink">
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
          'w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-mist/60',
          'transition-all duration-200 outline-none',
          'focus:border-royal focus:ring-2 focus:ring-royal/15',
          error ? 'border-red-400' : 'border-line hover:border-slate/30',
        ].join(' ')}
      />
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
          <Icon name="close" className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
