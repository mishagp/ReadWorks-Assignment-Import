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

    getJsonApiResource(urlSuffix) {
        var options = {
            'method': 'get',
            'contentType': 'application/json',
            'headers': {
                'x-auth': this.authToken,
            },
        };

        var response = UrlFetchApp.fetch(this.baseUrl + urlSuffix, options);
        return JSON.parse(response);
    }

    /**
     * Use username and password to get auth token via account/teacherSignIn
     */
    getAuthToken() {
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

            this.authToken = parsedResponse['token'];
            return this.authToken;
        }

        return this.authToken;
    }

    populateClasses() {
        var getClassesResponse = this.getJsonApiResource("class/getClasses");

        for (var i = 0; i < getClassesResponse.length; i++) {
            this.classes.push(new ReadWorksClass(getClassesResponse[i]));
        }


        return this;
    }

    populateAssignments() {
        for (var i = 0; i < this.classes.length; i++) {
            var getClassAssignmentsResponse = this.getJsonApiResource("assignment/teacherGetAssignments?cc=" + this.classes[i]['classCode']);
            for (var s = 0; s < getClassAssignmentsResponse.length; s++) {
                this.classes[i].assignments.push(new ReadWorksAssignment(getClassAssignmentsResponse[s]));
            }
        }
        ;

        return this;
    }

    populateStudents() {
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
        for (var i = 0; i < this.classes.length; i++) {
            for (var a = 0; a < this.classes[i].assignments.length; a++) {
                var requestURL = "assignment/teacherGetAssignmentResultsSummary?cc=" + this.classes[i]['classCode'] + "&aid=" + this.classes[i].assignments[a]['id'];
                var teacherGetAssignmentResultsSummary = this.getJsonApiResource(requestURL);
                // for (var s = 0; s < teacherGetAssignmentResultsSummary['smap'].length; s++) {
                //   this.classes[i].assignments[a].submittedAssignments.push(new ReadWorksSubmittedAssignment(teacherGetAssignmentResultsSummary['smap'][s]));
                // }
                for (var s in teacherGetAssignmentResultsSummary['smap']) {
                    this.classes[i].assignments[a].submittedAssignments.push(new ReadWorksSubmittedAssignment(teacherGetAssignmentResultsSummary['smap'][s]));
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
        var response = Browser.inputBox(
            "Authorize with ReadWorks",
            "Please enter your ReadWorks username (email)",
            Browser.Buttons.OK_CANCEL
        );
        this.username = response;
        return this.username;
    }

    /**
     * Get ReadWorks password from user via input prompt
     */
    requestPassword() {
        var response = Browser.inputBox(
            "Authorize with ReadWorks",
            "Please enter your ReadWorks password",
            Browser.Buttons.OK_CANCEL
        );
        this.password = response;
        return this.password;
    }

    logToConsole() {
        console.log(`ReadWorks(username=${this.username}, password=${this.password}, url=${this.url}, auth_token=${this.auth_token})`);
    }
}