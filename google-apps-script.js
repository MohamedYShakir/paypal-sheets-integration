var TARGET_SHEET_ID = 1635768111;

function getSheetById(doc, id) {
    var sheets = doc.getSheets();
    for (var i = 0; i < sheets.length; i++) {
        if (sheets[i].getSheetId() == id) {
            return sheets[i];
        }
    }
    return null;
}

function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        var doc = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = getSheetById(doc, TARGET_SHEET_ID);

        if (!sheet) {
            return ContentService
                .createTextOutput(JSON.stringify({ 'result': 'error', 'error': 'Target sheet not found' }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        var data = JSON.parse(e.postData.contents);

        // Column order: Date, Day, Month, Year, Transaction ID, Email, Name, Amount, Fee, Net, Currency, Status
        var rows = data.map(function (t) {
            return [
                t.date,
                t.day,
                t.month,
                t.year,
                t.id,
                t.email,
                t.name,
                t.amount,
                t.fee,
                t.net,
                t.currency,
                t.status
            ];
        });

        if (rows.length > 0) {
            var lastRow = sheet.getLastRow();
            sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);
        }

        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'success', 'count': rows.length }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (e) {
        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function doGet(e) {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getSheetById(doc, TARGET_SHEET_ID);

    if (!sheet) {
        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'error', 'error': 'Target sheet not found' }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    // READ DATA
    var rows = sheet.getDataRange().getValues();

    if (rows.length === 0) {
        return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'success', 'data': [] }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    // Column order: Date, Day, Month, Year, Transaction ID, Email, Name, Amount, Fee, Net, Currency, Status
    var data = [];

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var record = {};

        record['Date'] = row[0];
        record['Day'] = row[1];
        record['Month'] = row[2];
        record['Year'] = row[3];
        record['Transaction ID'] = row[4];
        record['Email'] = row[5];
        record['Name'] = row[6];
        record['Amount'] = row[7];
        record['Fee'] = row[8];
        record['Net'] = row[9];
        record['Currency'] = row[10];
        record['Status'] = row[11];

        data.push(record);
    }

    return ContentService
        .createTextOutput(JSON.stringify({ 'result': 'success', 'data': data }))
        .setMimeType(ContentService.MimeType.JSON);
}
