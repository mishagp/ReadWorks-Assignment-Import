/**
 * @OnlyCurrentDoc
 */

/**
 * Google Sheets onOpen function to add UI dropdown
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('ReadWorks')
        .addItem('Import Assignments', 'importAssignments')
        .addSeparator()
        .addItem('Create Blank Sheet', 'writeBlankSheet')
        .addToUi();
}

class ReadWorksAssignmentImportApp {
    constructor(username = "", password = "") {
        this.spreadsheetWriter = new SpreadsheetWriterApp();
        this.readWorksAPI = new ReadWorksAPIApp(username, password);
        this.parsedAssignments = [];
    }

    parseAssignments(assignments) {
        for (var i = 0; i < assignments.length; i++) {
            var rowData = [
                '', //'Recorded At',
                '', //'Teacher',
                '', //'Class',
                assignments[i].name, //'Student',
                '', //'Assignment Type',
                '', //'Assignment Grade Level',
                '', //'Assignment',
                '', //'Article',
                '', //'Words Read',
                '', //'Words Written',
                '', //'Calendar Month',
                '', //'Assignment Submitted At',
                '', //'Assignment Due At',
                '', //'Multiple Choice Score',
                '', //'Multiple Choice Total',
                '', //'Multiple Choice Grade',
                '', //'Written Answer Score',
                '', //'Written Answer Total',
                '', //'Written Answer Grade',
                '', //'Total Grade',
                '', //'Credit Hours Attempted',
                '', //'Credit Hours Granted',
                '', //'Comments Given',
                '', //'Reassigned for Revision',
                '', //'Reassigned for Redo',
                '', //'Notes',
            ]
            this.parsedAssignments.push(rowData);
        }
    }

    invoke() {
        this.readWorksAPI
            .populateClasses()
            .populateAssignments()
            .populateStudents()
            .populateSubmittedAssignments();

        this.parseAssignments(this.readWorksAPI.getSubmittedAssignments());

        this.spreadsheetWriter
            .createSheet()
            .writeAssignmentData(this.parsedAssignments);
    }
}

/**
 *
 */
function writeBlankSheet() {
    var sw = new SpreadsheetWriterApp();
    sheet = sw.createSheet();
}

function importAssignments(username = "", password = "") {
    var app = new ReadWorksAssignmentImportApp(username, password)
    app.invoke();
}