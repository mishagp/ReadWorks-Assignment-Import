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
            'Recorded',
            'Teacher',
            'Class',
            'Student',
            'Type',
            'Grade Level',
            'Assignment',
            'Article',
            'Words Read',
            'Words Written',
            'Proxy Hours Month',
            'Submitted',
            'Due Date',
            'Multiple Choice Score',
            'Multiple Choice Total',
            'Multiple Choice Grade',
            'Written Score',
            'Written Total',
            'Written Grade',
            'Total Grade',
            'Credit Hours Sought',
            'Credit Hours Earned',
            'Comments Given',
            'Reassigned (Revision)',
            'Reassigned (Redo)',
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

    formatSpreadsheet() {
        this.activeSheet.setFrozenRows(1);
        var activeRange = this.activeSheet.getRange("A1:Z" + (this.rowIncrement - 1));
        var headerRange = this.activeSheet.getRange("A1:Z1");
        var dataRange = this.activeSheet.getRange("A2:Z" + (this.rowIncrement - 1));
        activeRange.applyRowBanding(SpreadsheetApp.BandingTheme.BLUE, true, false);
        activeRange.setWrap(true);
        var styleMaps = {
            all: SpreadsheetApp.newTextStyle()
                .setFontSize(10)
                .build(),
            header: SpreadsheetApp.newTextStyle()
                .setBold(true)
                .setForegroundColor('white')
                .setFontSize(11)
                .build(),
        }
        headerRange.setTextStyle(styleMaps.header);
        dataRange.setVerticalAlignment('middle');
        activeRange.setHorizontalAlignment('center');
        this.activeSheet.setColumnWidth(1, 158);
        this.activeSheet.setColumnWidth(2, 75);
        this.activeSheet.setColumnWidth(3, 70);
        this.activeSheet.setColumnWidth(4, 135);
        this.activeSheet.setColumnWidth(5, 70);
        this.activeSheet.setColumnWidth(6, 50);
        this.activeSheet.setColumnWidth(7, 265); //G
        this.activeSheet.setColumnWidth(8, 190);
        this.activeSheet.setColumnWidth(9, 52);
        this.activeSheet.setColumnWidth(10, 58); //J
        this.activeSheet.setColumnWidth(11, 70);
        this.activeSheet.setColumnWidth(12, 80);
        this.activeSheet.setColumnWidth(13, 80);
        this.activeSheet.setColumnWidths(14, 9, 65); //N-V
        this.activeSheet.setColumnWidth(23, 200);
        this.activeSheet.setColumnWidth(24, 101);
        this.activeSheet.setColumnWidth(25, 101);
        this.activeSheet.setColumnWidth(26, 200);

        this.activeSheet.getRange("N2:T" + (this.rowIncrement - 1)).setNumberFormat('0.00');
        this.activeSheet.getRange("P2:P" + (this.rowIncrement - 1)).setNumberFormat('0.00%');
        this.activeSheet.getRange("S2:T" + (this.rowIncrement - 1)).setNumberFormat('0.00%');

        this.activeSheet.getRange("G2:H" + (this.rowIncrement - 1)).setHorizontalAlignment('left');
        this.activeSheet.getRange("W2:W" + (this.rowIncrement - 1)).setHorizontalAlignment('left').setVerticalAlignment('top');
        return this;
    }

    createPivotTable() {
        var ss = SpreadsheetApp.getActiveSpreadsheet();

        var pivotTableParams = {};

        // The source indicates the range of data you want to put in the table.
        // optional arguments: startRowIndex, startColumnIndex, endRowIndex, endColumnIndex
        pivotTableParams.source = {
            sheetId: this.activeSheet.getSheetId()
        };

        // Group rows, the 'sourceColumnOffset' corresponds to the column number in the source range
        // eg: 0 to group by the first column
        pivotTableParams.rows = [
            {
                sourceColumnOffset: 2,
                sortOrder: "ASCENDING",
                "showTotals": true,
            },
            {
                sourceColumnOffset: 3,
                sortOrder: "ASCENDING",
                "showTotals": true,
            },
            {
                sourceColumnOffset: 4,
                sortOrder: "ASCENDING",
                "showTotals": true,
            },
        ];

        // Defines how a value in a pivot table should be calculated.
        pivotTableParams.values = [
            {
                summarizeFunction: "SUM",
                name: "Credit Hours Sought",
                sourceColumnOffset: 20
            },
            {
                summarizeFunction: "SUM",
                name: "Credit Hours Earned",
                sourceColumnOffset: 21
            },
        ];

        // Create a new sheet which will contain our Pivot Table
        var pivotTableSheet = ss.insertSheet();
        var pivotTableSheetId = pivotTableSheet.getSheetId();
        var pivotTableSheetName = "Proxy Hours " + Utilities.formatDate(new Date(), "America/Chicago", "MMM yyyy");
        var itt = ss.getSheetByName(pivotTableSheetName);
        if (itt) {
            ss.deleteSheet(itt);
        }
        pivotTableSheet.setName(pivotTableSheetName);

        // Add Pivot Table to new sheet
        // Meaning we send an 'updateCells' request to the Sheets API
        // Specifying via 'start' the sheet where we want to place our Pivot Table
        // And in 'rows' the parameters of our Pivot Table
        var request = {
            "updateCells": {
                "rows": {
                    "values": [{
                        "pivotTable": pivotTableParams
                    }]
                },
                "start": {
                    "sheetId": pivotTableSheetId
                },
                "fields": "pivotTable"
            }
        };

        Sheets.Spreadsheets.batchUpdate({'requests': [request]}, ss.getId());

        const pivotTable = pivotTableSheet.getPivotTables()[0];

        // Get all existing filters and remove
        // @See https://developers.google.com/apps-script/reference/spreadsheet/pivot-table#getfilters
        const filters = pivotTable.getFilters();
        filters.map(f => f.remove());

        // Build new filter criteria
        // See https://developers.google.com/apps-script/reference/spreadsheet/filter-criteria
        const criteria = SpreadsheetApp.newFilterCriteria()
            .setVisibleValues([Utilities.formatDate(new Date(), "America/Chicago", "MMM yyyy")])
            .build();

        // Add filter to pivot
        // @See https://developers.google.com/apps-script/reference/spreadsheet/pivot-table#addfiltersourcedatacolumn,-filtercriteria
        pivotTable.addFilter(11, criteria);

        pivotTableSheet.setFrozenRows(1);
        var headerRange = pivotTableSheet.getRange("A1:E1");
        headerRange.setHorizontalAlignment('center');
        headerRange.setWrap(true);
        headerRange.setTextStyle(SpreadsheetApp.newTextStyle()
            .setBold(true)
            // .setForegroundColor('white')
            .setFontSize(11)
            .build());
        pivotTableSheet.setColumnWidth(1, 250);
        pivotTableSheet.setColumnWidth(2, 200);
        pivotTableSheet.setColumnWidth(3, 125);
        pivotTableSheet.setColumnWidth(4, 60);
        pivotTableSheet.setColumnWidth(5, 60);
    }
}