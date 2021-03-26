class ReadWorksSubmittedAssignment {
    constructor(data, assignment) {
        this.assignment = assignment;
        this.aadArticle = "N/A";
        this.aadWordsRead = "N/A";
        this.aadWordsWritten = "N/A";
        this.aadResponse = "";
        this.multipleChoiceScore = 0;
        this.multipleChoiceTotal = 0;
        this.writtenAnswerScore = 0;
        this.writtenAnswerTotal = 0;
        this.creditHoursSought = 0;
        this.creditHoursEarned = 0;
        this.commentsGiven = "";
        this.notes = "";
        this.name = data['f'] + " " + data['l'];
        if (data['s']) {
            this.submitted = true;
            this.timeSubmitted = data['ts'];
        } else {
            this.submitted = false;
            this.timeSubmitted = "";
        }
        if (data['aadWordsRead']) {
            this.aadWordsRead = data['aadWordsRead']
        }
        if (data['aadResponse']) {
            this.aadResponse = data['aadResponse'];
            this.aadWordsWritten = this.getWordCount(this.aadResponse)
        }
        if (data['aadArticle']) {
            this.aadArticle = data['aadArticle']
        }
        if (this.assignment.options.questionSets.length > 0) {
            this.parseQuestionSets(data);
        }
        this.calculateProxyHours();
        console.info("Imported assignment (aid)=>" + this.assignment.id);
    }

    parseQuestionSets(data) {

        for (var i = 0; i < this.assignment.options.questionSets.length; i++) {
            //for (var as = 0; as < answerSet.length; as++) {
            var questionCount = 1;
            for (var key in data['ans'][this.assignment.options.questionSets[i]]) {
                var questionResponse = data['ans'][this.assignment.options.questionSets[i]][key];
                if (questionResponse['qt'] == 0) {
                    this.multipleChoiceTotal++;
                    if (typeof questionResponse['s'] !== 'undefined') {
                        this.multipleChoiceScore += questionResponse['s'];
                    }

                } else if (questionResponse['qt'] == 1) {
                    this.writtenAnswerTotal++;
                    if (typeof questionResponse['s'] !== 'undefined') {
                        this.writtenAnswerScore += questionResponse['s'];
                    } else {
                        if (typeof questionResponse['t'] !== 'undefined') {
                            this.notes = "Written responses need grading.";
                        }
                    }
                    if (typeof questionResponse['f'] !== 'undefined') {
                        this.commentsGiven += "Q" + questionCount + ": " + questionResponse['f'] + "\n\n";
                    }
                } else if (questionResponse['qt'] == 4) {
                    this.multipleChoiceTotal++;
                    if (typeof questionResponse['s'] !== 'undefined') {
                        this.multipleChoiceScore += questionResponse['s'];
                    }
                } else if (questionResponse['qt'] == 5) {
                    this.multipleChoiceTotal++;
                    if (typeof questionResponse['s'] !== 'undefined') {
                        this.multipleChoiceScore += questionResponse['s'];
                    }
                } else {
                    throw new Error("Unhandled assignment question type encountered.")
                }
                questionCount++;
            }
        }
    }

    calculateProxyHours() {
        if (this.assignment.metadata.productType == "Paired Text") {
            if (this.assignment.metadata.grades == "9th-12th") {
                this.creditHoursSought = 1.5;
                if (this.getTotalGrade() >= 0.7) {
                    this.creditHoursEarned = 1.5;
                }
            } else {
                this.creditHoursSought = 1;
                if (this.getTotalGrade() >= 0.7) {
                    this.creditHoursEarned = 1;
                }
            }
        }
        if (this.assignment.metadata.productType == "Reading Passages") {
            this.creditHoursSought = 1;
            if (this.getTotalGrade() >= 0.7) {
                this.creditHoursEarned = 1;
            }
        }
        if (this.aadResponse) {
            this.creditHoursSought = 0.25;
            this.creditHoursEarned = 0.25;
        }
    }

    getMultipleChoiceGrade() {
        if (this.multipleChoiceTotal > 0) {
            return this.multipleChoiceScore / this.multipleChoiceTotal;
        } else {
            return 0;
        }
    }

    getWrittenAnswerGrade() {
        if (this.writtenAnswerTotal > 0) {
            return this.writtenAnswerScore / this.writtenAnswerTotal;
        } else {
            return 0;
        }
    }

    getTotalGrade() {
        if ((this.writtenAnswerTotal + this.multipleChoiceTotal) > 0) {
            return (this.writtenAnswerScore + this.multipleChoiceScore) / (this.writtenAnswerTotal + this.multipleChoiceTotal);
        } else {
            return 0;
        }
    }

    getWordCount(string) {
        return string.replace(/\s+/g, " ").split(" ").length;
    }
}