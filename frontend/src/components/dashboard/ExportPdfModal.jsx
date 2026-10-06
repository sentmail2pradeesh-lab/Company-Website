import { useState, useEffect, useMemo } from 'react';
import {
  FiX,
  FiPrinter,
  FiCheckSquare,
  FiSquare,
  FiSliders,
  FiFileText,
  FiEye,
  FiCalendar,
  FiCheck,
} from 'react-icons/fi';

const AVAILABLE_COLUMNS = [
  { id: 'inputDate', label: 'Input Date', defaultWidth: '110px', align: 'left' },
  { id: 'propertyName', label: 'Property name', defaultWidth: '220px', align: 'left' },
  { id: 'service', label: 'Service', defaultWidth: '130px', align: 'left' },
  { id: 'numberOfImages', label: 'Number Of Images', defaultWidth: '120px', align: 'center' },
  { id: 'comments', label: 'Comments', defaultWidth: '180px', align: 'left' },
  { id: 'jobId', label: 'Job ID', defaultWidth: '90px', align: 'left' },
  { id: 'client', label: 'Client', defaultWidth: '90px', align: 'left' },
  { id: 'editorName', label: 'Editor Name', defaultWidth: '140px', align: 'left' },
  { id: 'stage', label: 'Role / Stage', defaultWidth: '110px', align: 'left' },
  { id: 'activeMinutes', label: 'Active Mins', defaultWidth: '90px', align: 'center' },
  { id: 'status', label: 'Status', defaultWidth: '100px', align: 'center' },
];

const PRESETS = {
  googleSheet: {
    name: 'Google Sheet Format',
    description: 'Input Date, Property Name, Service, Number Of Images, Comments',
    columns: ['inputDate', 'propertyName', 'service', 'numberOfImages', 'comments'],
  },
  teamAudit: {
    name: 'Team Production Format',
    description: 'Includes Property, Service, Images, Editor, Stage & Status',
    columns: ['inputDate', 'propertyName', 'service', 'numberOfImages', 'editorName', 'stage', 'status'],
  },
  fullAudit: {
    name: 'Full Audit (All Columns)',
    description: 'Every recorded field including active duration and job ID',
    columns: AVAILABLE_COLUMNS.map((c) => c.id),
  },
};

const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export default function ExportPdfModal({ isOpen, onClose, data = [], defaultTitle = '' }) {
  const [reportTitle, setReportTitle] = useState(
    defaultTitle || `September 2026`
  );
  const [reportSubtitle, setReportSubtitle] = useState('Vista Editz / ASZEN Production Operations Log');
  const [headerTheme, setHeaderTheme] = useState('classicRed'); // 'classicRed' (matching screenshot) | 'modernSlate'
  const [orientation, setOrientation] = useState('landscape'); // 'landscape' | 'portrait'
  const [selectedColumns, setSelectedColumns] = useState(['inputDate', 'propertyName', 'service', 'numberOfImages', 'comments']);
  const [activePreset, setActivePreset] = useState('googleSheet');

  useEffect(() => {
    if (isOpen && defaultTitle) {
      setReportTitle(defaultTitle);
    }
  }, [isOpen, defaultTitle]);

  if (!isOpen) return null;

  const handleToggleColumn = (colId) => {
    setActivePreset('custom');
    if (selectedColumns.includes(colId)) {
      if (selectedColumns.length === 1) return;
      setSelectedColumns(selectedColumns.filter((c) => c !== colId));
    } else {
      setSelectedColumns([...selectedColumns, colId]);
    }
  };

  const handleApplyPreset = (presetKey) => {
    setActivePreset(presetKey);
    setSelectedColumns(PRESETS[presetKey].columns);
  };

  const totalImages = data.reduce(
    (sum, row) => sum + (Number(row.numberOfImages !== undefined ? row.numberOfImages : row.filesProcessed) || 0),
    0
  );

  const getCellValue = (row, colId) => {
    switch (colId) {
      case 'inputDate':
        return row.inputDate || row.date || '-';
      case 'propertyName':
        return row.propertyName || row.name || 'untitled folder';
      case 'service':
        return row.service || row.stage || 'RE Editing';
      case 'numberOfImages':
        return row.numberOfImages !== undefined ? row.numberOfImages : row.filesProcessed || 0;
      case 'comments':
        return row.comments || '';
      case 'jobId':
        return row.jobId ? `#${row.jobId}` : '-';
      case 'client':
        return row.client || '-';
      case 'editorName':
        return row.editorName || 'Unassigned';
      case 'stage':
        return row.stage || row.role || '-';
      case 'activeMinutes':
        return row.activeMinutes ? `${row.activeMinutes}m` : '0m';
      case 'status':
        return row.status || 'Verified';
      default:
        return row[colId] || '';
    }
  };

  const handlePrintPdf = () => {
    const activeCols = AVAILABLE_COLUMNS.filter((c) => selectedColumns.includes(c.id));
    const headerBg =
      headerTheme === 'classicRed'
        ? '#8A0000'
        : '#0F172A';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups for this site to generate the PDF.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${reportTitle}</title>
          <style>
            @page {
              size: ${orientation};
              margin: 12mm 10mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 0;
              font-size: 11px;
            }
            .header-banner {
              text-align: center;
              margin-bottom: 14px;
              padding-bottom: 6px;
            }
            .main-title {
              font-size: 26pt;
              font-weight: 900;
              letter-spacing: -0.5px;
              margin: 0 0 4px 0;
              color: #000000;
            }
            .sub-title {
              font-size: 10pt;
              color: #475569;
              margin: 0;
              font-weight: 600;
            }
            .meta-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 9pt;
              color: #64748b;
              margin-bottom: 8px;
              padding: 0 2px;
            }
            .meta-tag {
              font-weight: 700;
              color: #0f172a;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border: 2px solid #000000;
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            thead th {
              background-color: ${headerBg} !important;
              color: #ffffff !important;
              font-weight: 800;
              font-size: 11pt;
              padding: 8px 10px;
              border: 1px solid #330000;
              text-align: left;
              white-space: nowrap;
            }
            thead th.text-center {
              text-align: center;
            }
            tbody td {
              padding: 7px 10px;
              border: 1px solid #000000;
              font-size: 10.5pt;
              color: #000000;
            }
            tbody td.text-center {
              text-align: center;
              font-variant-numeric: tabular-nums;
            }
            tbody tr:nth-child(even) {
              background-color: #f8fafc !important;
            }
            tfoot tr {
              background-color: #f1f5f9 !important;
              font-weight: 800;
              border-top: 2px solid #000000;
            }
            tfoot td {
              padding: 8px 10px;
              border: 1px solid #000000;
              font-size: 11pt;
            }
            .footer-note {
              margin-top: 10px;
              font-size: 8pt;
              color: #64748b;
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <h1 class="main-title">${reportTitle}</h1>
            ${reportSubtitle ? `<p class="sub-title">${reportSubtitle}</p>` : ''}
          </div>
          <div class="meta-bar">
            <div>Total Entries: <span class="meta-tag">${data.length}</span> · Total Images: <span class="meta-tag">${totalImages}</span></div>
            <div>Generated: <span class="meta-tag">${new Date().toLocaleDateString()}</span></div>
          </div>
          <table>
            <thead>
              <tr>
                ${activeCols
                  .map(
                    (col) => `
                  <th class="${col.align === 'center' ? 'text-center' : ''}" style="width: ${col.defaultWidth}">
                    ${col.label}
                  </th>`
                  )
                  .join('')}
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (row) => `
                <tr>
                  ${activeCols
                    .map((col) => {
                      const val = getCellValue(row, col.id);
                      return `<td class="${col.align === 'center' ? 'text-center' : ''}">${escapeHtml(val !== undefined && val !== null ? val : '')}</td>`;
                    })
                    .join('')}
                </tr>`
                )
                .join('')}
            </tbody>
            <tfoot>
              ${(() => {
                const imgColIdx = activeCols.findIndex((c) => c.id === 'numberOfImages');
                if (imgColIdx !== -1) {
                  const preColspan = imgColIdx;
                  const postColspan = activeCols.length - imgColIdx - 1;
                  return `
                    <tr>
                      ${preColspan > 0 ? `<td colspan="${preColspan}">Total Summary</td>` : `<td>Total</td>`}
                      <td class="text-center font-bold">${totalImages}</td>
                      ${postColspan > 0 ? `<td colspan="${postColspan}"></td>` : ''}
                    </tr>
                  `;
                }
                return `
                  <tr>
                    <td colspan="${activeCols.length}">Total Records: ${data.length}</td>
                  </tr>
                `;
              })()}
            </tfoot>
          </table>
          <div class="footer-note">
            Confidential · Vista Editz Production Management System
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200/90 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <FiPrinter className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                Export Production Sheet to PDF
              </h2>
              <p className="text-xs text-slate-400">
                Select custom columns, presets, and formatting for print and vector PDF export.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto custom-scrollbar">
          {/* Report Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Report Main Title
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g. September 2026"
                className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900 focus:outline-none transition-all shadow-2xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Sub-Title / Header Note
              </label>
              <input
                type="text"
                value={reportSubtitle}
                onChange={(e) => setReportSubtitle(e.target.value)}
                placeholder="e.g. Monthly Output Summary"
                className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FiSliders className="w-3.5 h-3.5 text-indigo-600" /> Column Presets
              </label>
              <span className="text-xs text-slate-400 font-medium">Click to apply standard layout</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {Object.entries(PRESETS).map(([key, preset]) => {
                const isActive = activePreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleApplyPreset(key)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs text-slate-900 mb-0.5">
                      <span>{preset.name}</span>
                      {isActive && <FiCheck className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{preset.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Column Selection Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Fields to Include in PDF ({selectedColumns.length} of {AVAILABLE_COLUMNS.length})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActivePreset('custom');
                    setSelectedColumns(AVAILABLE_COLUMNS.map((c) => c.id));
                  }}
                  className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setActivePreset('googleSheet');
                    setSelectedColumns(PRESETS.googleSheet.columns);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {AVAILABLE_COLUMNS.map((col) => {
                const isChecked = selectedColumns.includes(col.id);
                return (
                  <label
                    key={col.id}
                    onClick={() => handleToggleColumn(col.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-white text-indigo-900 shadow-2xs border border-indigo-200'
                        : 'text-slate-500 hover:bg-slate-200/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="truncate">{col.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Styling Options: Header Color & Page Orientation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Table Header Theme
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHeaderTheme('classicRed')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    headerTheme === 'classicRed'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-[#8A0000]"></span>
                  <span>Classic Red (Spreadsheet)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHeaderTheme('modernSlate')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    headerTheme === 'modernSlate'
                      ? 'bg-slate-100 border-slate-900 text-slate-900 ring-2 ring-slate-300'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-[#0F172A]"></span>
                  <span>Modern Slate</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Page Layout
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    orientation === 'landscape'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Landscape (Wide)
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    orientation === 'portrait'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Portrait (Tall)
                </button>
              </div>
            </div>
          </div>

          {/* Report Output Summary Stat */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-600 font-medium">
              Ready to export <strong className="text-slate-900">{data.length}</strong> records with{' '}
              <strong className="text-indigo-600 font-mono">{totalImages}</strong> total images.
            </span>
            <span className="text-[11px] font-mono text-slate-500 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
              {orientation.toUpperCase()} · {selectedColumns.length} COLS
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePrintPdf}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <FiPrinter className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
