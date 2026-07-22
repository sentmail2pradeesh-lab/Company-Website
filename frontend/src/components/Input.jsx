export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
}) {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={name} className="input-group__label">
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
        className={`input-group__field ${error ? 'input-group__field--error' : ''}`}
      />
      {error && <span className="input-group__error">{error}</span>}
    </div>
  );
}
