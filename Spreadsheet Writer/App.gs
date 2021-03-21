class SpreadsheetWriterApp {
    constructor(data) {
        this.data = data;
        this.activeSheet = null;
        this.rowIncrement = 1;
        this.sheetName = Utilities.formatDate(new Date(), "America/Chicago", "MM-dd-yyyy hh:mm:ss a");
    }

    createSheet() {
        var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        var sa = activeSpreadsheet.insertSheet(this.sheetName);
        var rangeExpression = "A" + this.rowIncrement + ":Z" + this.rowIncrement;
        sa.getRange(rangeExpression).setValues([[
            'Recorded At',
            'Teacher',
            'Class',
            'Student',
            'Assignment Type',
            'Assignment Grade Level',
            'Assignment',
            'Article',
            'Words Read',
            'Words Written',
            'Calendar Month',
            'Assignment Submitted At',
            'Assignment Due At',
            'Multiple Choice Score',
            'Multiple Choice Total',
            'Multiple Choice Grade',
            'Written Answer Score',
            'Written Answer Total',
            'Written Answer Grade',
            'Total Grade',
            'Credit Hours Attempted',
            'Credit Hours Granted',
            'Comments Given',
            'Reassigned for Revision',
            'Reassigned for Redo',
            'Notes',
        ]]);
        this.activeSheet = sa;
        this.rowIncrement++;
        return this;
    }

    writeAssignmentData(parsedAssignments) {
        // var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        //var activeSheet = activeSpreadsheet.getSheetByName(this.sheetName);
        var assignmentCount = parsedAssignments.length;
        if (assignmentCount > 0) {
            var rangeExpression = "A" + this.rowIncrement + ":Z" + (this.rowIncrement + assignmentCount - 1);
            console.log(rangeExpression);
            this.activeSheet.getRange(rangeExpression).setValues(parsedAssignments);
            this.rowIncrement = this.rowIncrement + assignmentCount;
        }
        return this;
    }
}