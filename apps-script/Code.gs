/**
 * ============================================================
 * Mattra Inc. — Form Submissions Router
 *
 * Watches the "Submissions" tab for new rows and routes each
 * entry to a per-form-type tab with one column per field.
 *
 * Setup: Run setup() once from the Apps Script editor.
 *        It creates a 1-minute trigger that auto-processes
 *        new submissions.
 * ============================================================
 */

// ── Config ──────────────────────────────────────────────────
var CONFIG = {
  submissionsTab: 'Submissions',
  jsonCol: 9,          // Column I — "All Fields (JSON)"
  formTypeCol: 2,      // Column B — "Form Type"
  timestampCol: 1,     // Column A — "Timestamp"
  processedCol: 10,    // Column J — "Processed" flag (added by script)

  // Fields to skip (internal / not useful in the organized tabs)
  skipFields: ['site_slug', 'recaptcha_token', '_honey', '_ts', 'form_type', 'send_visitor_copy'],

  // Preferred column order (fields listed here appear first, in this order)
  preferredOrder: [
    'first_name', 'last_name', 'full_name', 'name',
    'email', 'phone', 'concern',
    'zip', 'timeline', 'sms_consent',
    'subject', 'message'
  ],

  // Header row styling
  headerBg: '#316b43',
  headerColor: '#ffffff'
};


// ── Main processor ──────────────────────────────────────────
function processNewSubmissions() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var submissions = ss.getSheetByName(CONFIG.submissionsTab);
  if (!submissions) return;

  var lastRow = submissions.getLastRow();
  if (lastRow < 2) return; // No data rows

  var data = submissions.getRange(1, 1, lastRow, Math.max(submissions.getLastColumn(), CONFIG.processedCol)).getValues();
  var headers = data[0];

  // Ensure "Processed" header exists
  if (headers.length < CONFIG.processedCol || headers[CONFIG.processedCol - 1] !== 'Processed') {
    submissions.getRange(1, CONFIG.processedCol).setValue('Processed');
  }

  var count = 0;
  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    // Skip already-processed rows
    if (String(row[CONFIG.processedCol - 1]).trim() === 'Yes') continue;

    // Skip empty rows
    var timestamp = row[CONFIG.timestampCol - 1];
    if (!timestamp) continue;

    var formType = String(row[CONFIG.formTypeCol - 1] || 'other').trim();
    var jsonStr  = String(row[CONFIG.jsonCol - 1] || '{}').trim();

    var fields;
    try {
      fields = JSON.parse(jsonStr);
    } catch (e) {
      fields = {};
    }

    // Route to the form-type tab
    var tabName = formatTabName(formType);
    var tab = ss.getSheetByName(tabName);

    if (!tab) {
      tab = createFormTab(ss, tabName, fields);
    }

    // Read current tab headers
    var tabLastCol = Math.max(tab.getLastColumn(), 1);
    var tabHeaders = tab.getRange(1, 1, 1, tabLastCol).getValues()[0]
      .map(function(h) { return String(h).trim(); })
      .filter(function(h) { return h.length > 0; });

    // Check for new fields not yet in the tab headers
    var fieldKeys = getOrderedFieldKeys(fields);
    var newKeys = [];
    for (var k = 0; k < fieldKeys.length; k++) {
      var key = fieldKeys[k];
      var header = formatHeader(key);
      if (tabHeaders.indexOf(header) === -1) {
        newKeys.push(key);
      }
    }

    // Add new column headers if needed
    if (newKeys.length > 0) {
      for (var n = 0; n < newKeys.length; n++) {
        var nextCol = tabHeaders.length + 1;
        var newHeader = formatHeader(newKeys[n]);
        tab.getRange(1, nextCol).setValue(newHeader)
          .setFontWeight('bold')
          .setBackground(CONFIG.headerBg)
          .setFontColor(CONFIG.headerColor);
        tabHeaders.push(newHeader);
      }
    }

    // Build the output row
    var outRow = [];
    for (var c = 0; c < tabHeaders.length; c++) {
      var colHeader = tabHeaders[c];

      if (colHeader === 'Timestamp') {
        outRow.push(formatTimestamp(timestamp));
        continue;
      }

      // Find the matching field key
      var matchKey = findFieldKey(fields, colHeader);
      if (matchKey !== null) {
        var val = fields[matchKey];
        outRow.push(Array.isArray(val) ? val.join(', ') : String(val));
      } else {
        outRow.push('');
      }
    }

    tab.appendRow(outRow);

    // Mark as processed
    submissions.getRange(i + 1, CONFIG.processedCol).setValue('Yes');
    count++;
  }

  if (count > 0) {
    Logger.log('Processed ' + count + ' new submission(s).');
  }
}


// ── Create a new form-type tab ──────────────────────────────
function createFormTab(ss, name, sampleFields) {
  var tab = ss.insertSheet(name);

  // Build headers: Timestamp first, then fields in preferred order
  var headers = ['Timestamp'];
  var fieldKeys = getOrderedFieldKeys(sampleFields);
  for (var i = 0; i < fieldKeys.length; i++) {
    headers.push(formatHeader(fieldKeys[i]));
  }

  tab.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Style the header row
  var headerRange = tab.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground(CONFIG.headerBg);
  headerRange.setFontColor(CONFIG.headerColor);
  headerRange.setHorizontalAlignment('center');
  tab.setFrozenRows(1);

  // Auto-resize columns
  for (var c = 1; c <= headers.length; c++) {
    tab.setColumnWidth(c, 150);
  }
  tab.setColumnWidth(1, 180); // Wider timestamp column

  return tab;
}


// ── Helpers ─────────────────────────────────────────────────

/** Convert form_type slug to a readable tab name */
function formatTabName(formType) {
  return String(formType)
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, function(c) { return c.toUpperCase(); });
}

/** Convert a field key to a readable column header */
function formatHeader(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, function(c) { return c.toUpperCase(); });
}

/** Format ISO timestamp to readable date */
function formatTimestamp(ts) {
  if (!ts) return '';
  try {
    var d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts);
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'MM/dd/yyyy hh:mm a');
  } catch (e) {
    return String(ts);
  }
}

/** Get field keys in preferred order, skipping internal fields */
function getOrderedFieldKeys(fields) {
  var keys = Object.keys(fields).filter(function(k) {
    return CONFIG.skipFields.indexOf(k) === -1 && !k.startsWith('_');
  });

  // Sort: preferred-order fields first, then alphabetical
  keys.sort(function(a, b) {
    var idxA = CONFIG.preferredOrder.indexOf(a);
    var idxB = CONFIG.preferredOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  return keys;
}

/** Find the field key in `fields` that matches a column header */
function findFieldKey(fields, header) {
  var keys = Object.keys(fields);
  for (var i = 0; i < keys.length; i++) {
    if (formatHeader(keys[i]) === header) {
      return keys[i];
    }
  }
  return null;
}


// ── Setup (run once) ────────────────────────────────────────

/**
 * Run this function ONCE from the Apps Script editor:
 *   1. Open the script editor (Extensions > Apps Script)
 *   2. Select "setup" from the function dropdown
 *   3. Click Run
 *   4. Approve permissions when prompted
 *
 * It will:
 *   - Create a 1-minute trigger to auto-process new submissions
 *   - Process any existing unprocessed rows immediately
 *   - Create per-form-type tabs with individual columns
 */
function setup() {
  // Remove any existing triggers for this function
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'processNewSubmissions') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Create a time-based trigger — runs every 1 minute
  ScriptApp.newTrigger('processNewSubmissions')
    .timeBased()
    .everyMinutes(1)
    .create();

  // Process any existing rows right now
  processNewSubmissions();

  // Confirm
  var msg = 'Setup complete!\n\n'
    + '- Trigger created: processNewSubmissions runs every 1 minute\n'
    + '- Existing submissions have been routed to per-form-type tabs\n'
    + '- New submissions will be auto-processed within 60 seconds';

  try {
    SpreadsheetApp.getUi().alert(msg);
  } catch (e) {
    Logger.log(msg);
  }
}


/**
 * Run this to reprocess ALL submissions (clears "Processed" flags
 * and re-routes everything). Useful if you change column order or
 * want to rebuild the tabs from scratch.
 */
function reprocessAll() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var submissions = ss.getSheetByName(CONFIG.submissionsTab);
  if (!submissions) return;

  var lastRow = submissions.getLastRow();
  if (lastRow < 2) return;

  // Clear all "Processed" flags
  submissions.getRange(2, CONFIG.processedCol, lastRow - 1, 1).clearContent();

  // Delete all form-type tabs (not "Submissions")
  var sheets = ss.getSheets();
  for (var i = sheets.length - 1; i >= 0; i--) {
    var name = sheets[i].getName();
    if (name !== CONFIG.submissionsTab) {
      ss.deleteSheet(sheets[i]);
    }
  }

  // Reprocess
  processNewSubmissions();

  try {
    SpreadsheetApp.getUi().alert('All submissions have been reprocessed and tabs rebuilt.');
  } catch (e) {
    Logger.log('Reprocess complete.');
  }
}
