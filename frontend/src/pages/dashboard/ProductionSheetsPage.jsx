import { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import { FiFileText, FiCheckCircle, FiSearch, FiCalendar } from 'react-icons/fi';

export default function ProductionSheetsPage() {
  const { productionSheets } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-08-27');

  const filteredSheets = productionSheets.filter((sheet) => {
    const matchesSearch =
      sheet.editorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.jobId.includes(searchTerm);
    const matchesDate = !selectedDate || sheet.date === selectedDate;
    return matchesSearch && matchesDate;
  });

  const totalFiles = filteredSheets.reduce((acc, s) => acc + s.filesProcessed, 0);
  const totalActiveMins = filteredSheets.reduce((acc, s) => acc + s.activeMinutes, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 mb-2">
            <FiFileText className="w-3.5 h-3.5" /> Daily Production Sheets
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Employee Production Logs & Output Sheets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Recorded time logs, break durations, and processed output count per employee stage.
          </p>
        </div>

        {/* Metrics Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Output</div>
            <div className="text-base font-bold font-mono text-cyan-400">{totalFiles} Files</div>
          </div>
          <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Net Active Time</div>
            <div className="text-base font-bold font-mono text-emerald-400">{Math.floor(totalActiveMins / 60)}h {totalActiveMins % 60}m</div>
          </div>
        </div>
      </div>

      {/* Filter Bar & Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4 overflow-hidden">
        <div className="p-5 pb-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Editor, Client, or Job ID..."
              className="w-full bg-slate-50 text-slate-800 pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto text-xs text-slate-500">
            <FiCalendar className="w-4 h-4 text-indigo-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Worksheet Table with Dark Header Accent */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Role / Stage</th>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4 text-center">Files Processed</th>
                <th className="py-3 px-4 text-center">Active Time</th>
                <th className="py-3 px-4 text-center">Pause Duration</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
              {filteredSheets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No production logs found for selected date and filter.
                  </td>
                </tr>
              ) : (
                filteredSheets.map((sheet) => (
                  <tr key={sheet.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">{sheet.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{sheet.editorName}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-indigo-700 border border-slate-200 font-mono text-[11px]">
                        {sheet.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">#{sheet.jobId}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{sheet.client}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                      {sheet.filesProcessed}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">
                      {sheet.activeMinutes} mins
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-purple-700">
                      {sheet.pauseMinutes} mins
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-md text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                        <FiCheckCircle className="w-3 h-3" /> {sheet.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
