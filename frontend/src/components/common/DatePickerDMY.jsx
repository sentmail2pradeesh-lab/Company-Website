import { useRef, useState, useEffect } from 'react';
import { FiCalendar } from 'react-icons/fi';
import { formatDateDMY, parseDMYToISO } from '../../utils/dateUtils';

export default function DatePickerDMY({
  value,
  onChange,
  min,
  max,
  required = false,
  className = '',
  placeholder = 'dd/mm/yyyy',
  id,
  name,
  disabled = false,
}) {
  const hiddenInputRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(formatDateDMY(value) || '');

  useEffect(() => {
    setDisplayValue(formatDateDMY(value) || '');
  }, [value]);

  const handleTextChange = (e) => {
    const text = e.target.value;
    setDisplayValue(text);
    const iso = parseDMYToISO(text);
    if (iso) {
      if (min && iso < min) return;
      if (max && iso > max) return;
      onChange?.(iso);
    }
  };

  const handleOpenPicker = () => {
    if (disabled) return;
    try {
      if (hiddenInputRef.current?.showPicker) {
        hiddenInputRef.current.showPicker();
      } else {
        hiddenInputRef.current?.focus();
        hiddenInputRef.current?.click();
      }
    } catch {
      hiddenInputRef.current?.click();
    }
  };

  return (
    <div className="relative inline-flex items-center w-full">
      <input
        type="text"
        id={id}
        name={name}
        value={displayValue}
        onChange={handleTextChange}
        onClick={handleOpenPicker}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full pr-10 font-mono ${className}`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={handleOpenPicker}
        disabled={disabled}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer p-1"
        aria-label="Open Calendar"
      >
        <FiCalendar className="w-4 h-4" />
      </button>
      <input
        ref={hiddenInputRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={value || ''}
        min={min}
        max={max}
        onChange={(e) => {
          if (e.target.value) {
            onChange?.(e.target.value);
            setDisplayValue(formatDateDMY(e.target.value));
          }
        }}
        className="sr-only absolute bottom-0 left-0 w-0 h-0 opacity-0 pointer-events-none"
      />
    </div>
  );
}
