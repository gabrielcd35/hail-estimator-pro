/**
 * Scope Sheet <-> Google Sheets webhook.
 *
 * SETUP (one time, ~2 minutes):
 * 1. Create (or open) the Google Sheet you want submissions saved to.
 * 2. Extensions -> Apps Script. Delete any starter code and paste this whole file in.
 * 3. Click Deploy -> New deployment -> type: Web app.
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4. Click Deploy, authorize it with your Google account, and copy the Web App URL.
 * 5. In Vercel: Project -> Settings -> Environment Variables -> add
 *      SCOPE_SHEET_WEBHOOK_URL = <that Web App URL>
 *    then redeploy.
 *
 * doPost: appends one row per panel to "Scope Sheet Submissions" (created
 * automatically the first time).
 * doGet: returns every submission grouped by submittedAt, newest first —
 * used by the app's Scope Sheet history screen.
 *
 * IMPORTANT: if you already deployed an older version of this script, redeploy
 * (Deploy -> Manage deployments -> edit -> New version) after pasting this in,
 * so the Web App URL picks up the doGet handler and the new Oversize column.
 */

var SHEET_NAME = 'Scope Sheet Submissions';
var HEADERS = ['Submitted At', 'Panel', 'Dent Range', 'Mode', 'Replacements', 'Note', 'Oversize'];

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }

  var data = JSON.parse(e.postData.contents);
  var submittedAt = data.submittedAt || new Date().toISOString();

  (data.panels || []).forEach(function (p) {
    sheet.appendRow([
      submittedAt,
      p.panel || '',
      p.dentRange || '',
      p.mode || '',
      (p.replacements || []).join(', '),
      p.note || '',
      p.oversize || '',
    ]);
  });

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ submissions: [] })).setMimeType(ContentService.MimeType.JSON);
  }

  var values = sheet.getDataRange().getValues();
  var rows = values.slice(1); // skip header row
  var grouped = {};

  rows.forEach(function (r) {
    var submittedAt = r[0];
    if (!submittedAt) return;
    var key = String(submittedAt);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      panel: r[1],
      dentRange: r[2],
      mode: r[3],
      replacements: r[4] ? String(r[4]).split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [],
      note: r[5],
      oversize: r[6],
    });
  });

  var submissions = Object.keys(grouped)
    .sort()
    .reverse()
    .map(function (key) { return { submittedAt: key, panels: grouped[key] }; });

  return ContentService.createTextOutput(JSON.stringify({ submissions: submissions })).setMimeType(ContentService.MimeType.JSON);
}
