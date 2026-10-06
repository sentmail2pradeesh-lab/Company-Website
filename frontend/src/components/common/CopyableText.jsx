import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

/**
 * Enterprise one-click copy component.
 * Allows instant copying of Job IDs, Client codes, and reference numbers
 * without selecting text. Features a micro-animation checkmark feedback.
 */
export default function CopyableText({
  text,
  displayText,
  prefix = '',
  className = '',
  title = 'Click to copy',
}) {
  const [copied, setCopied] = useState(false);

  const cleanTextToCopy = String(text ?? '').trim();
  const shown = displayText ?? cleanTextToCopy;

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!cleanTextToCopy) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(cleanTextToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = cleanTextToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied to clipboard!' : `${title}: ${cleanTextToCopy}`}
      className={`group relative inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 font-mono text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer ${className}`}
    >
      <span>
        {prefix}
        {shown}
      </span>

      <span className="shrink-0 transition-all duration-200">
        {copied ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1 py-0.2 rounded animate-fadeIn">
            <FiCheck className="w-3 h-3 stroke-[2.5]" />
            <span className="font-sans font-semibold">Copied</span>
          </span>
        ) : (
          <FiCopy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
        )}
      </span>
    </button>
  );
}
