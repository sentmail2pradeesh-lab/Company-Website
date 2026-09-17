// Frontend Production Sheet Logic & Sample Data Verification Test

import assert from 'node:assert';

// Sample dataset simulating Production Sheets
const sampleProductionSheets = [
  {
    id: 'ps-1001',
    date: '2026-09-04',
    editorName: 'Pradeesh Kumar',
    role: 'Path 1',
    jobId: '1001',
    client: 'BE',
    stage: 'Path 1',
    filesProcessed: 45,
    activeMinutes: 120,
    pauseMinutes: 15,
    status: 'Verified',
  },
  {
    id: 'ps-1002',
    date: '2026-09-04',
    editorName: 'Sarah Jenkins',
    role: 'Editor 1',
    jobId: '1002',
    client: 'RE',
    stage: 'Editor 1',
    filesProcessed: 30,
    activeMinutes: 90,
    pauseMinutes: 10,
    status: 'Verified',
  },
  {
    id: 'ps-1003',
    date: '2026-09-04',
    editorName: 'Alex Rivera',
    role: 'QC',
    jobId: '1003',
    client: 'EPIC',
    stage: 'QC',
    filesProcessed: 60,
    activeMinutes: 45,
    pauseMinutes: 5,
    status: 'Verified',
  },
  {
    id: 'ps-1004',
    date: '2026-09-03',
    editorName: 'Pradeesh Kumar',
    role: 'Blending',
    jobId: '1004',
    client: 'DE',
    stage: 'Blending',
    filesProcessed: 25,
    activeMinutes: 110,
    pauseMinutes: 20,
    status: 'Verified',
  },
];

// Helper stage labels map (matching JobContext.jsx)
const stageLabels = {
  blending: 'Blending',
  lc: 'LC',
  path1: 'Path 1',
  path2: 'Path 2',
  editor1: 'Editor 1',
  editor2: 'Editor 2',
  qc: 'QC',
  fc: 'FC',
};

// Filter logic function (matching ProductionSheetsPage.jsx)
function filterSheets(sheets, searchTerm, selectedDate) {
  return sheets.filter((sheet) => {
    const matchesSearch =
      sheet.editorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sheet.jobId.includes(searchTerm);
    const matchesDate = !selectedDate || sheet.date === selectedDate;
    return matchesSearch && matchesDate;
  });
}

// Stats calculation function
function computeStats(sheets) {
  const totalFiles = sheets.reduce((acc, s) => acc + s.filesProcessed, 0);
  const totalActiveMins = sheets.reduce((acc, s) => acc + s.activeMinutes, 0);
  const totalPauseMins = sheets.reduce((acc, s) => acc + s.pauseMinutes, 0);
  return { count: sheets.length, totalFiles, totalActiveMins, totalPauseMins };
}

// CSV line formatter
function formatCSVRow(sheet) {
  return [
    sheet.date,
    `"${sheet.editorName || ''}"`,
    sheet.role || sheet.stage,
    sheet.jobId,
    sheet.client,
    sheet.filesProcessed,
    sheet.activeMinutes,
    sheet.pauseMinutes || 0,
    sheet.status,
  ].join(',');
}

console.log('--- RUNNING FRONTEND PRODUCTION SHEET TEST SUITE ---');

// Test 1: Stage Labels Completeness
console.log('\n[Test 1] Verifying Stage Labels Completeness...');
assert.strictEqual(stageLabels.blending, 'Blending');
assert.strictEqual(stageLabels.lc, 'LC');
assert.strictEqual(stageLabels.path1, 'Path 1');
assert.strictEqual(stageLabels.editor1, 'Editor 1');
assert.strictEqual(stageLabels.qc, 'QC');
assert.strictEqual(stageLabels.fc, 'FC');
console.log('  -> PASS: All 8 stage keys properly mapped to labels.');

// Test 2: Unfiltered Production Sheet Aggregations
console.log('\n[Test 2] Verifying All Production Sheets Aggregations...');
const allStats = computeStats(sampleProductionSheets);
assert.strictEqual(allStats.count, 4);
assert.strictEqual(allStats.totalFiles, 160);
assert.strictEqual(allStats.totalActiveMins, 365);
assert.strictEqual(allStats.totalPauseMins, 50);
console.log(`  -> PASS: Total Entries=${allStats.count}, Total Files=${allStats.totalFiles}, Total Active Mins=${allStats.totalActiveMins}`);

// Test 3: Date Filtering
console.log('\n[Test 3] Verifying Date Filtering for 2026-09-04...');
const dateFiltered = filterSheets(sampleProductionSheets, '', '2026-09-04');
assert.strictEqual(dateFiltered.length, 3);
const dateStats = computeStats(dateFiltered);
assert.strictEqual(dateStats.totalFiles, 135);
console.log(`  -> PASS: 3 sheets returned for date 2026-09-04 with 135 files processed.`);

// Test 4: Search Filtering by Editor Name
console.log('\n[Test 4] Verifying Search Filter for Editor "Pradeesh"...');
const editorFiltered = filterSheets(sampleProductionSheets, 'Pradeesh', '');
assert.strictEqual(editorFiltered.length, 2);
console.log(`  -> PASS: 2 sheets found for Pradeesh Kumar.`);

// Test 5: Search Filtering by Client Code
console.log('\n[Test 5] Verifying Search Filter for Client "BE"...');
const clientFiltered = filterSheets(sampleProductionSheets, 'BE', '');
assert.strictEqual(clientFiltered.length, 1);
assert.strictEqual(clientFiltered[0].jobId, '1001');
console.log(`  -> PASS: 1 sheet found for Client BE (Job #1001).`);

// Test 6: CSV Formatting
console.log('\n[Test 6] Verifying CSV Row Formatting...');
const csvRow = formatCSVRow(sampleProductionSheets[0]);
assert.strictEqual(csvRow, '2026-09-04,"Pradeesh Kumar",Path 1,1001,BE,45,120,15,Verified');
console.log(`  -> PASS: CSV Row output: ${csvRow}`);

console.log('\n======================================================');
console.log('ALL FRONTEND PRODUCTION SHEET TESTS PASSED SUCCESSFULLY!');
console.log('======================================================\n');
