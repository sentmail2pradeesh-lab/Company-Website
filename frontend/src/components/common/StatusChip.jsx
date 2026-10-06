import React from 'react';

/**
 * Standardized semantic status badge used across Vista Editz tables.
 * Follows top-tier IT design standards (Stripe / Linear) with clean borders,
 * soft translucent background tints, and active status indicators.
 */
export default function StatusChip({ status = 'Pending', className = '', showDot = true, size = 'sm' }) {
  const norm = String(status || '').trim().toLowerCase();

  let dotColor = 'bg-slate-400';
  let badgeStyle = 'bg-slate-50 text-slate-700 border-slate-200/80';
  let isPulsing = false;

  if (['approved', 'verified', 'completed', 'complete'].includes(norm)) {
    dotColor = 'bg-emerald-500';
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200/90 shadow-2xs';
  } else if (['active', 'shift active', 'in progress', 'running'].includes(norm)) {
    dotColor = 'bg-emerald-500';
    badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200/90 shadow-2xs';
    isPulsing = true;
  } else if (['pending', 'on break', 'under review', 'qc pending', 'path pending'].includes(norm)) {
    dotColor = 'bg-amber-500';
    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200/90';
    isPulsing = norm.includes('pending') || norm.includes('review');
  } else if (['rejected', 'cancelled', 'overdue', 'failed'].includes(norm)) {
    dotColor = 'bg-rose-500';
    badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200/90';
  } else if (['unassigned', 'paused', 'idle', 'draft'].includes(norm)) {
    dotColor = 'bg-slate-400';
    badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200';
  }

  const sizeClasses = size === 'xs'
    ? 'px-2 py-0.5 text-[10px]'
    : 'px-2.5 py-1 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold tracking-tight border transition-all ${sizeClasses} ${badgeStyle} ${className}`}
    >
      {showDot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {isPulsing && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}></span>
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`}></span>
        </span>
      )}
      <span className="capitalize">{status}</span>
    </span>
  );
}
