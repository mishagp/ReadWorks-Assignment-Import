class ReadWorksAPIApp {
    constructor(username = "", password = "", baseUrl = "https://www.readworks.org/v2/") {
        this.username = username;
        this.password = password;
        this.baseUrl = baseUrl;
        this.authToken = "";
        this.classes = [];
        this.submittedAssignments = [];
        this.getAuthToken();
    }

    getJsonApiResource(urlSuffix, useBaseUrl = true) {
        var options = {
            'method': 'get',
            'contentType': 'application/json',
            'headers': {
                'x-auth': this.authToken,
            },
        };
        var url = null;
        if (useBaseUrl) {
            url = this.baseUrl + urlSuffix;
        } else {
            url = urlSuffix;
        }
        console.info("API GET: " + url);
        var response = UrlFetchApp.fetch(url, options);
        return JSON.parse(response);
    }

    /**
     * Use username and password to get auth token via account/teacherSignIn
     */
    getAuthToken() {
        SpreadsheetApp.getActiveSpreadsheet().toast('(0%) Connecting to ReadWorks...', 'ReadWorks Assignment Import');
        if (!this.authToken) {
            if (!this.username) {
                this.requestUsername();
            }
            if (!this.password) {
                this.requestPassword();
            }
            var options = {
                'method': 'post',
                'contentType': 'application/json',
                'payload': JSON.stringify({
                    'e': this.username,
                    'p': this.password,
                }),
            };

            var response = UrlFetchApp.fetch(this.baseUrl + "account/teacherSignIn", options);
            var parsedResponse = JSON.parse(response);

            this.teacher = new ReadWorksTeacher(parsedResponse);

            this.authToken = parsedResponse['token'];
            return this.authToken;
        }

        return this.authToken;
    }

    populateClasses() {
        SpreadsheetApp.getActiveSpreadsheet().toast('(10%) Populating classes...', 'ReadWorks Assignment Import', 3);
        var getClassesResponse = this.getJsonApiResource("class/getClasses");

        for (var i = 0; i < getClassesResponse.length; i++) {
            this.classes.push(new ReadWorksClass(getClassesResponse[i], this.teacher));
        }


        return this;
    }

    populateAssignments() {
        SpreadsheetApp.getActiveSpreadsheet().toast('(20%) Populating assignments...', 'ReadWorks Assignment Import', 3);
        for (var i = 0; i < this.classes.length; i++) {
            var getClassAssignmentsResponse = this.getJsonApiResource("assignment/teacherGetAssignments?cc=" + this.classes[i]['classCode']);
            for (var s = 0; s < getClassAssignmentsResponse.length; s++) {
                this.classes[i].assignments.push(new ReadWorksAssignment(getClassAssignmentsResponse[s], this.classes[i]));
            }
        }
        ;

        return this;
    }

    populateStudents() {
        SpreadsheetApp.getActiveSpreadsheet().toast('(30%) Populating students...', 'ReadWorks Assignment Import', 3);
        for (var i = 0; i < this.classes.length; i++) {
            var getClassRosterResponse = this.getJsonApiResource("class/getClassRoster?cc=" + this.classes[i]['classCode']);
            for (var s = 0; s < getClassRosterResponse['s'].length; s++) {
                this.classes[i].students.push(new ReadWorksStudent(getClassRosterResponse['s'][s]));
            }
        }
        ;

        return this;
    }

    populateSubmittedAssignments() {
        SpreadsheetApp.getActiveSpreadsheet().toast('(40%) Populating submitted assignments, this may take a few minutes...', 'ReadWorks Assignment Import', 200);
        for (var i = 0; i < this.classes.length; i++) {
            for (var a = 0; a < this.classes[i].assignments.length; a++) {
                var requestURL = "assignment/teacherGetAssignmentResultsSummary?cc=" + this.classes[i]['classCode'] + "&aid=" + this.classes[i].assignments[a]['id'];
                var teacherGetAssignmentResultsSummary = this.getJsonApiResource(requestURL);
                if (this.classes[i].assignments[a].metadata.productType == "Article-A-Day") {
                    for (var s in teacherGetAssignmentResultsSummary['smap']) {
                        var baseData = teacherGetAssignmentResultsSummary['smap'][s];
                        for (var key in teacherGetAssignmentResultsSummary['smap'][s]['aad']) {
                            if (teacherGetAssignmentResultsSummary['smap'][s]['aad'][key]["s"]) {
                                var articleData = baseData;

                                articleData['aadWordsRead'] = this.getJsonApiResource("https://dnmkr7tf85gze.cloudfront.net/data/p/" + key, false)['wordcount'];
                                articleData['aadResponse'] = teacherGetAssignmentResultsSummary['smap'][s]['aad'][key]["b"];
                                articleData['ts'] = teacherGetAssignmentResultsSummary['smap'][s]['aad'][key]["tf"];
                                articleData['s'] = "s";
                                articleData['aadArticle'] = teacherGetAssignmentResultsSummary['smap'][s]['aad'][key]["n"];

                                this.classes[i].assignments[a].submittedAssignments.push(new ReadWorksSubmittedAssignment(articleData, this.classes[i].assignments[a]));
                            }
                        }
                    }
                    //TODO
                } else {
                    for (var s in teacherGetAssignmentResultsSummary['smap']) {
                        this.classes[i].assignments[a].submittedAssignments.push(new ReadWorksSubmittedAssignment(teacherGetAssignmentResultsSummary['smap'][s], this.classes[i].assignments[a]));
                    }
                }


            }
        }
        ;
        return this;
    }

    getSubmittedAssignments() {
        var submittedAssignments = [];

        for (var i = 0; i < this.classes.length; i++) {
            for (var a = 0; a < this.classes[i].assignments.length; a++) {
                for (var s = 0; s < this.classes[i].assignments[a].submittedAssignments.length; s++) {
                    submittedAssignments.push(this.classes[i].assignments[a].submittedAssignments[s]);
                }
            }
        }
        ;

        return submittedAssignments;
    }

    /**
     * Get ReadWorks username from user via input prompt
     */
    requestUsername() {
        var ui = SpreadsheetApp.getUi();
        var result = ui.prompt('Connect to ReadWorks', 'Please enter your ReadWorks username (email):', ui.ButtonSet.OK_CANCEL);
        var button = result.getSelectedButton();
        var text = result.getResponseText();
        if (button == ui.Button.CANCEL) {
            throw new Error('No username provided, cancelling assignment import.');
        } else if (button == ui.Button.CLOSE) {
            throw new Error('No username provided, cancelling assignment import.');
        }
        this.username = text;
        return this.username;
    }

    /**
     * Get ReadWorks password from user via input prompt
     */
    requestPassword() {
        var ui = SpreadsheetApp.getUi();
        var result = ui.prompt('Connect to ReadWorks', 'Please enter your ReadWorks password:', ui.ButtonSet.OK_CANCEL);
        var button = result.getSelectedButton();
        var text = result.getResponseText();
        if (button == ui.Button.CANCEL) {
            throw new Error('No password provided, cancelling assignment import.');
        } else if (button == ui.Button.CLOSE) {
            throw new Error('No password provided, cancelling assignment import.');
        }

        this.password = text;
        return this.password;
    }

    logToConsole() {
        console.log(`ReadWorks(username=${this.username}, password=${this.password}, url=${this.url}, auth_token=${this.auth_token})`);
    }
}