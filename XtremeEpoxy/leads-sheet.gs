/**
 * Xtreme Epoxy Coatings — leads logger
 * Google Apps Script web app. Receives a POST from the website's quote/booking
 * form and appends the row to the "Leads" sheet. Formspree still handles email;
 * this fills the spreadsheet in parallel.
 *
 * SETUP: see SHEETS-SETUP.md. In short — paste this into the sheet's Apps Script
 * editor (Extensions -> Apps Script), then Deploy -> New deployment -> Web app,
 * Execute as: Me, Who has access: Anyone. Copy the /exec URL back to Alex.
 *
 * The website posts JSON as text/plain (avoids a CORS preflight the script
 * can't answer). Body shape: { "row": [ ...18 cells... ] }
 */

// Column headers, written automatically to row 1 if the sheet is empty.
// Order matches the trackerCols array built in the site's finish() function.
var HEADERS = [
  'Date', 'Type', 'Name', 'Phone', 'Email', 'Town', 'Service', 'Size',
  'Condition', 'Finish', 'Est Low', 'Est High', 'Requested Day',
  'Requested Time', 'Source', 'Status', 'Reserved', 'Notes'
];

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Leads') || ss.getSheets()[0];

    // Write the header row once, on the first submission into an empty sheet.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var data = JSON.parse(e.postData.contents);
    var row = data.row || [];
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Lets you open the /exec URL in a browser to confirm the app is deployed.
function doGet() {
  return ContentService
    .createTextOutput('Xtreme Epoxy leads logger is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}
