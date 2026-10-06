import React from 'react';
import { FiInbox, FiSearch, FiCalendar, FiFileText } from 'react-icons/fi';

const ICONS = {
  inbox: FiInbox,
  search: FiSearch,
  calendar: FiCalendar,
  file: FiFileText,
};

/**
 * Modern illustrated empty state box for tables, lists, and filter results.
 * Features clean iconography, supportive descriptions, and optional quick-action buttons.
 */
export default function EmptyState({
  icon = 'inbox',
  title = 'No items found',
  description = 'There are no records matching your current filter.',
  actionLabel,
  onAction,
  className = '',
}) {
  const IconComponent = ICONS[icon] || FiInbox;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-3.5 shadow-2xs">
        <IconComponent className="w-7 h-7 stroke-[1.75]" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 font-sans tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
