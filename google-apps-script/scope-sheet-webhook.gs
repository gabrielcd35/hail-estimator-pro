/**
 * Scope Sheet → Google Sheets webhook.
 *
 * SETUP (one time, ~2 minutes):
 * 1. Create (or open) the Google Sheet you want submissions saved to.
 * 2. Extensions → Apps Script. Delete any starter code and paste this whole file in.
 * 3. Click Deploy → New deployment → type: Web app.
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4. Click Deploy, authorize it with your Google account, and copy the Web App URL.
 * 5. In Vercel: Project → Settings → Environment Variables → add
 *      SCOPE_SHEET_WEBHOOK_URL = <that Web App URL>
 *    then redeploy.
 *
 * Every submission from the app appends one row per panel to a sheet named
 * "Scope Sheet Submissions" (created automatically the first time).
 */
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Scope Sheet Submissions';
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(['Submitted At', 'Panel', 'Dent Range', 'Mode', 'Replacements', 'Note']);
  }

  const data = JSON.parse(e.postData.contents);
  const submittedAt = data.submittedAt || new Date().toISOString();

  (data.panels || []).forEach(function (p) {
    sheet.appendRow([
      submittedAt,
      p.panel || '',
      p.dentRange || '',
      p.mode || '',
      (p.replacements || []).join(', '),
      p.note || '',
    ]);
  });

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
