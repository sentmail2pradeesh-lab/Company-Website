import React from 'react';

/**
 * Silicon Valley style shimmer skeleton loader for tables.
 * Displays animated glowing placeholder wireframes matching column counts.
 */
export default function TableSkeleton({ rows = 5, cols = 6, height = 'h-4' }) {
  const rowList = Array.from({ length: rows });
  const colList = Array.from({ length: cols });

  return (
    <tbody className="divide-y divide-slate-100 bg-white">
      {rowList.map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse">
          {colList.map((_, cIdx) => (
            <td key={cIdx} className="py-3.5 px-4">
              <div
                className={`bg-slate-200/80 rounded-md ${height} ${
                  cIdx === 0
                    ? 'w-16'
                    : cIdx === 1
                      ? 'w-24'
                      : cIdx === cols - 1
                        ? 'w-20'
                        : 'w-full max-w-[120px]'
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
