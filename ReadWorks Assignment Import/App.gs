/**
 * @OnlyCurrentDoc
 */

/**
 * Google Sheets onOpen function to add UI dropdown
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('ReadWorks')
        .addItem('Import All Assignments', 'importAssignments')
        .addSeparator()
        .addItem('Return All Assignments for Revision', 'returnRevise')
        .addItem('Return All Assignments for Redo', 'returnRedo')
        .addSeparator()
        .addItem('Clean up sheets', 'deleteSheets')
        .addToUi();
}

function deleteSheets() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();

    var itt = ss.getSheetByName("Welcome");
    if (itt) {
        ss.deleteSheet(itt);
    }

    var welcomeSheet = ss.insertSheet();
    welcomeSheet.setName("Welcome");
    var pivotTableSheetName = "Welcome";
    for (i = 0; i < sheets.length; i++) {
        switch (sheets[i].getSheetName()) {
            case "Welcome":
                break;
            default:
                ss.deleteSheet(sheets[i]);
        }
    }
}

function returnRedo() {
    const ui = SpreadsheetApp.getUi();
    ui.alert("This feature is not ready yet, please try again later!");
}

function returnRevise() {
    const ui = SpreadsheetApp.getUi();
    ui.alert("This feature is not ready yet, please try again later!");
}

class ReadWorksAssignmentImportApp {
    constructor(username = "", password = "") {
        this.spreadsheetWriter = new SpreadsheetWriterApp();
        this.readWorksAPI = new ReadWorksAPIApp(username, password);
        this.parsedAssignments = [];
    }

    parseAssignments(assignments) {
        for (var i = 0; i < assignments.length; i++) {
            var submittedAtOutput = "";
            var submittedAtMonthOutput = "";
            if (assignments[i].submitted) {
                submittedAtOutput = Utilities.formatDate(new Date(assignments[i].timeSubmitted * 1000), "America/Chicago", "MM/dd/yyyy");
                submittedAtMonthOutput = Utilities.formatDate(new Date(assignments[i].timeSubmitted * 1000), "America/Chicago", "MMM yyyy");
            }
            var rowData = [
                Utilities.formatDate(new Date(), "America/Chicago", "MM/dd/yyyy hh:mm:ss a"), //'Recorded At',
                assignments[i].assignment.rwClass.teacher.getName(), //'Teacher',
                assignments[i].assignment.rwClass.name, //'Class',
                assignments[i].name, //'Student',
                assignments[i].assignment.metadata.productType, //'Assignment Type',
                assignments[i].assignment.metadata.grades, //'Assignment Grade Level',
                assignments[i].assignment.metadata.title, //'Assignment',
                assignments[i].aadArticle, //'Article',
                assignments[i].aadWordsRead, //'Words Read',
                assignments[i].aadWordsWritten, //'Words Written',

                submittedAtMonthOutput,//Utilities.formatDate(new Date(assignments[i].timeSubmitted*1000), "America/Chicago", "mmm yyyy"), //'Calendar Month',
                submittedAtOutput, //'Assignment Submitted At',
                Utilities.formatDate(new Date(assignments[i].assignment.dueDate * 1000), "America/Chicago", "MM/dd/yyyy"), //'Assignment Due At',
                assignments[i].multipleChoiceScore, //'Multiple Choice Score',
                assignments[i].multipleChoiceTotal, //'Multiple Choice Total',
                assignments[i].getMultipleChoiceGrade(), //'Multiple Choice Grade',
                assignments[i].writtenAnswerScore, //'Written Answer Score',
                assignments[i].writtenAnswerTotal, //'Written Answer Total',
                assignments[i].getWrittenAnswerGrade(), //'Written Answer Grade',
                assignments[i].getTotalGrade(), //'Total Grade',
                assignments[i].creditHoursSought, //'Credit Hours Attempted',
                assignments[i].creditHoursEarned, //'Credit Hours Granted',
                assignments[i].commentsGiven, //'Comments Given',
                'N/A', //'Reassigned for Revision', TODO
                'N/A', //'Reassigned for Redo', TODO
                assignments[i].notes, //'Notes', TODO
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

        SpreadsheetApp.getActiveSpreadsheet().toast('(90%) Parsing submitted assignment data for output...', 'ReadWorks Assignment Import', 60);
        this.parseAssignments(this.readWorksAPI.getSubmittedAssignments());

        SpreadsheetApp.getActiveSpreadsheet().toast('(95%) Writing data to new spreadsheet...', 'ReadWorks Assignment Import', 60);
        this.spreadsheetWriter
            .createSheet()
            .writeAssignmentData(this.parsedAssignments)
            .formatSpreadsheet()
            .createPivotTable();


        SpreadsheetApp.getActiveSpreadsheet().toast('(100%) Done! You are a great teacher :)', 'ReadWorks Assignment Import', 10);
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