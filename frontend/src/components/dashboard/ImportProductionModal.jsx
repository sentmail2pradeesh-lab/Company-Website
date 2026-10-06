import { useState, useEffect, useMemo } from 'react';
import { useJobs } from '../../context/JobContext';
import {
  FiX,
  FiUploadCloud,
  FiClipboard,
  FiFileText,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
  FiCheck,
  FiBriefcase,
  FiLock,
  FiEdit3,
} from 'react-icons/fi';
import { getOperationalDate, formatDateDMY } from '../../utils/dateUtils';
import DatePickerDMY from '../common/DatePickerDMY';

export default function ImportProductionModal({
  isOpen,
  onClose,
  onImportSuccess,
  defaultClientCode = 'BE',
  isClientLocked = false,
}) {
  const { clients } = useJobs();
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'upload' | 'manual'
  const [pasteText, setPasteText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successCount, setSuccessCount] = useState(null);

  // Client Selection State
  const [selectedClient, setSelectedClient] = useState(defaultClientCode || 'BE');
  const [customClient, setCustomClient] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Sync when modal opens or defaultClientCode changes
  useEffect(() => {
    if (isOpen) {
      const initialClient = defaultClientCode || (clients && clients.length > 0 ? clients[0].code : 'BE');
      setSelectedClient(initialClient);
      setIsCustomMode(false);
      setCustomClient('');
      setErrorMessage('');
      setSuccessCount(null);
    }
  }, [isOpen, defaultClientCode, clients]);

  // Compute effective client code
  const effectiveClient = useMemo(() => {
    if (isCustomMode && customClient.trim()) {
      return customClient.trim().toUpperCase();
    }
    return (selectedClient || 'BE').toUpperCase();
  }, [isCustomMode, customClient, selectedClient]);

  // Update existing parsed rows if user changes client selection mid-way
  const handleClientChange = (newClientCode) => {
    if (newClientCode === '__CUSTOM__') {
      setIsCustomMode(true);
      return;
    }
    setIsCustomMode(false);
    setSelectedClient(newClientCode);
    setParsedRows((prev) => prev.map((r) => ({ ...r, client: newClientCode.toUpperCase() })));
  };

  const handleCustomClientChange = (e) => {
    const code = e.target.value.toUpperCase();
    setCustomClient(code);
    setParsedRows((prev) => prev.map((r) => ({ ...r, client: code || 'BE' })));
  };

  // Manual Form State
  const [manualDate, setManualDate] = useState(() => getOperationalDate());
  const [manualPropertyName, setManualPropertyName] = useState('');
  const [manualService, setManualService] = useState('RE Editing');
  const [manualImages, setManualImages] = useState('');
  const [manualComments, setManualComments] = useState('');

  if (!isOpen) return null;

  // Robust delimiter parser supporting Tabs and quoted CSV commas
  const parseDelimitedLine = (line) => {
    if (line.includes('\t')) {
      return line.split('\t').map((p) => p.trim().replace(/^["']|["']$/g, ''));
    }
    // Regex supporting quoted CSV tokens with embedded commas
    const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g;
    const parts = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      parts.push((val || '').trim());
    }
    return parts;
  };

  // Helper to parse pasted raw text (supports Tab-delimited from Google Sheets/Excel or Comma-delimited CSV)
  const parseRawText = (text, clientToUse = effectiveClient) => {
    setErrorMessage('');
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const newRows = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = parseDelimitedLine(line);

      // Check if header row
      const firstLower = (parts[0] || '').toLowerCase();
      if (firstLower.includes('date') || firstLower.includes('input') || firstLower.includes('property')) {
        continue;
      }

      if (parts.length >= 2) {
        let rawDate = parts[0] || getOperationalDate();
        let rawProperty = 'untitled folder';
        let rawService = 'RE Editing';
        let rawImages = 0;
        let rawComments = '';
        let rowClient = clientToUse || 'BE';

        // Check if format has client column (e.g. Exported format: Date, Property, Service, Images, Comments, JobID, Client)
        if (parts.length >= 7 && parts[6]) {
          rawProperty = parts[1] || 'untitled folder';
          rawService = parts[2] || 'RE Editing';
          rawImages = Number(parts[3]) || 0;
          rawComments = parts[4] || '';
          rowClient = parts[6].trim().toUpperCase() || clientToUse || 'BE';
        } else {
          // Standard Google Sheet Format: Date, Property name, Service, Number Of Images, Comments
          rawProperty = parts[1] || 'untitled folder';
          rawService = parts[2] || 'RE Editing';
          rawImages = Number(parts[3]) || 0;
          rawComments = parts[4] || '';

          // If columns were swapped: Date, Property, Images, Service, Comments
          if (isNaN(rawImages) && !isNaN(Number(parts[2]))) {
            rawImages = Number(parts[2]);
            rawService = parts[3] || 'RE Editing';
          }
        }

        newRows.push({
          id: `imp-${Date.now()}-${i}`,
          inputDate: rawDate,
          date: rawDate,
          propertyName: rawProperty,
          service: rawService,
          numberOfImages: rawImages,
          filesProcessed: rawImages,
          comments: rawComments,
          client: rowClient,
          editorName: 'Staff',
          stage: rawService,
          status: 'Verified',
        });
      }
    }

    if (newRows.length === 0) {
      setErrorMessage('Could not detect valid rows. Ensure format is: Date [Tab] Property name [Tab] Service [Tab] Number Of Images [Tab] Comments');
    } else {
      setParsedRows(newRows);
    }
  };

  const handlePasteChange = (e) => {
    const val = e.target.value;
    setPasteText(val);
    parseRawText(val, effectiveClient);
  };

  // CSV File Upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setPasteText(text);
        parseRawText(text, effectiveClient);
        setActiveTab('paste');
      }
    };
    reader.readAsText(file);
  };

  // Add Manual Entry to Parsed Batch
  const handleAddManualRow = (e) => {
    e.preventDefault();
    if (!manualPropertyName.trim()) return;

    const newRow = {
      id: `imp-manual-${Date.now()}`,
      inputDate: manualDate || getOperationalDate(),
      date: manualDate || getOperationalDate(),
      propertyName: manualPropertyName.trim(),
      service: manualService.trim() || 'RE Editing',
      numberOfImages: Number(manualImages) || 0,
      filesProcessed: Number(manualImages) || 0,
      comments: manualComments.trim(),
      client: effectiveClient || 'BE',
      editorName: 'Staff',
      stage: manualService.trim() || 'RE Editing',
      status: 'Verified',
    };

    setParsedRows([newRow, ...parsedRows]);
    setManualPropertyName('');
    setManualImages('');
    setManualComments('');
  };

  const handleRemoveRow = (id) => {
    setParsedRows(parsedRows.filter((r) => r.id !== id));
  };

  const downloadSampleTemplate = () => {
    const headers = 'Input Date,Property name,Service,Number Of Images,Comments\n';
    const sampleRows = [
      '09-01-2026,untitled folder,RE Editing,67,First batch',
      '09-01-2026,untitled folder 2,RE Editing,48,Dusk correction',
      '09-01-2026,untitled folder 3,RE Editing,62,Standard retouch',
      '09-02-2026,untitled folder,RE Editing,21,Rush delivery',
    ].join('\n');
    const blob = new Blob([headers + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `production_sheet_${effectiveClient}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);
    try {
      // Ensure all rows strictly inherit effectiveClient
      const preparedRows = parsedRows.map((r) => ({
        ...r,
        client: r.client || effectiveClient || 'BE',
      }));

      if (onImportSuccess) {
        await onImportSuccess(preparedRows);
      }
      setSuccessCount(preparedRows.length);
      setTimeout(() => {
        setIsImporting(false);
        setSuccessCount(null);
        setParsedRows([]);
        setPasteText('');
        onClose();
      }, 1000);
    } catch (err) {
      setIsImporting(false);
      setErrorMessage('Failed to save imported rows. Please try again.');
    }
  };

  const totalBatchImages = parsedRows.reduce((sum, r) => sum + (Number(r.numberOfImages) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-3xl border border-slate-200/90 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <FiUploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                Import Previous Production Sheets
              </h2>
              <p className="text-xs text-slate-400">
                Paste rows from Google Sheets / Excel or upload a CSV. The system auto-assigns each row to the chosen client.
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

        {/* Client Attribution Banner */}
        <div className="px-6 py-3.5 bg-indigo-50/70 border-b border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              <FiBriefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Target Client Assignment:</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono text-xs font-black shadow-2xs">
                  {effectiveClient}
                </span>
                {isClientLocked && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                    <FiLock className="w-2.5 h-2.5 text-slate-500" /> Locked to Tab
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Every imported row will be tagged with client <strong>[{effectiveClient}]</strong> for both client-wise & consolidated sheets.
              </p>
            </div>
          </div>

          {/* Client Selector (Editable unless explicitly locked) */}
          {!isClientLocked ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isCustomMode ? (
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <select
                    value={selectedClient}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer w-full sm:w-auto"
                  >
                    {clients && clients.length > 0 ? (
                      clients.map((c) => (
                        <option key={c.id || c.code} value={c.code}>
                          [{c.code}] {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="BE">[BE] Bright Estate Media</option>
                        <option value="PR">[PR] Prime Real Estate</option>
                        <option value="LUX">[LUX] Luxury Visuals</option>
                        <option value="VUE">[VUE] Vue 360 Studios</option>
                      </>
                    )}
                    <option value="__CUSTOM__">+ Enter New Client Code...</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="CLIENT CODE"
                    value={customClient}
                    onChange={handleCustomClientChange}
                    maxLength={8}
                    className="bg-white border border-indigo-400 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-indigo-700 w-28 uppercase focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomMode(false);
                      setSelectedClient(clients?.[0]?.code || 'BE');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Choose Existing
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs font-mono font-bold text-indigo-800 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-2xs">
              Client: {effectiveClient}
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FiClipboard className="w-4 h-4" /> Paste from Spreadsheet (Fastest)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FiUploadCloud className="w-4 h-4" /> Upload CSV
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <FiPlus className="w-4 h-4" /> Add Single Row
            </button>
          </div>

          <button
            type="button"
            onClick={downloadSampleTemplate}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            title="Download CSV sample format template"
          >
            <FiDownload className="w-3.5 h-3.5" /> Sample Template
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto custom-scrollbar">
          {/* TAB 1: PASTE FROM SPREADSHEET */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Paste Cells (Ctrl + V)
                </label>
                <span className="text-[11px] text-slate-400">
                  Format: <strong>Input Date</strong> • <strong>Property name</strong> • <strong>Service</strong> • <strong>Images</strong> • <strong>Comments</strong>
                </span>
              </div>
              <textarea
                value={pasteText}
                onChange={handlePasteChange}
                rows={6}
                placeholder="Example: Select cells from Google Sheets and paste here:&#10;09-01-2026	untitled folder	RE Editing	67	Comments&#10;09-01-2026	untitled folder 2	RE Editing	48&#10;09-01-2026	untitled folder 3	RE Editing	62"
                className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl p-3 text-xs font-mono text-slate-900 focus:outline-none transition-all"
              />
            </div>
          )}

          {/* TAB 2: UPLOAD CSV FILE */}
          {activeTab === 'upload' && (
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center transition-all bg-slate-50">
              <FiUploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">Click to select or drag a CSV file</p>
              <p className="text-xs text-slate-400 mt-1">Accepts .csv files matching the Google Sheet columns</p>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="mt-4 block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
          )}

          {/* TAB 3: ADD SINGLE MANUAL ROW */}
          {activeTab === 'manual' && (
            <form onSubmit={handleAddManualRow} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Add Individual Entry to Batch</span>
                <span className="text-indigo-600 font-mono font-bold text-[11px]">Assigned to: {effectiveClient}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Input Date</label>
                  <DatePickerDMY
                    value={manualDate}
                    onChange={(d) => setManualDate(d)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Property Name / Folder</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. untitled folder"
                    value={manualPropertyName}
                    onChange={(e) => setManualPropertyName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Service</label>
                  <input
                    type="text"
                    value={manualService}
                    onChange={(e) => setManualService(e.target.value)}
                    placeholder="e.g. RE Editing"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Number Of Images</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 67"
                    value={manualImages}
                    onChange={(e) => setManualImages(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Comments (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Notes / instructions"
                  value={manualComments}
                  onChange={(e) => setManualComments(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FiPlus className="w-4 h-4" /> Add Row to Import Batch
              </button>
            </form>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* PARSED PREVIEW TABLE */}
          {parsedRows.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Preview Data to Import ({parsedRows.length} Rows)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Client: {effectiveClient}
                  </span>
                  <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Total Images: {totalBatchImages}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto overflow-y-auto max-h-[260px] custom-scrollbar border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="sticky top-0 z-10 bg-slate-900 text-white uppercase text-[11px] font-bold shadow-2xs">
                    <tr>
                      <th className="py-2.5 px-3">Input Date</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3">Property name</th>
                      <th className="py-2.5 px-3">Service</th>
                      <th className="py-2.5 px-3 text-center">Images</th>
                      <th className="py-2.5 px-3">Comments</th>
                      <th className="py-2.5 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                    {parsedRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">{row.inputDate}</td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[11px] font-extrabold border border-indigo-200">
                            {row.client || effectiveClient}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900">{row.propertyName}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-indigo-700 font-mono text-[11px] font-semibold">
                            {row.service}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-extrabold text-emerald-700">
                          {row.numberOfImages}
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[11px] truncate max-w-[160px]">
                          {row.comments || '—'}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                            title="Remove row"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setParsedRows([]);
                  setPasteText('');
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Clear Preview
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={parsedRows.length === 0 || isImporting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isImporting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Importing...</span>
                </>
              ) : successCount ? (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>Imported {successCount} Rows to [{effectiveClient}]!</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  <span>Confirm & Import {parsedRows.length} Records to [{effectiveClient}]</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
