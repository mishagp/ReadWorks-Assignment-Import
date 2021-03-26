class ReadWorksAssignmentMetadata {
    constructor(data) {
        this.wordCount = data['wordcount'];
        this.thumbnailUrl = data['img'];
        this.domains = data['s'];
        this.productType = this.parseProductType(data['pt']);
        this.textType = data['t'];
        this.lexileCodes = data['lc'];
        if (this.productType == "Paired Text") {
            var grades = [];
            for (var key in data.articles) {
                for (var i = 0; i < data.articles[key]['g'].length; i++) {
                    grades.push(data.articles[key]['g'][i]);
                }
            }
            this.parseGradeLevels(grades);
        } else {
            this.grades = this.parseGradeLevels(data['g']);
        }
        this.title = data['title'];
    }

    parseGradeLevels(grades) {
        var parsedGradeLevel = "";
        for (var i = 0; i < grades.length; i++) {
            switch (grades[i]) {
                case "346":
                case "347":
                    parsedGradeLevel = "9th-12th";
                    break;
                default:
                    parsedGradeLevel = "K-8th";
                    break;
            }
        }
        return parsedGradeLevel;
    }

    parseProductType(pt) {
        var parsedProductType = ""
        switch (pt) {
            case "A":
                parsedProductType = "Reading Passages";
                break;
            case "AAD":
                parsedProductType = "Article-A-Day";
                break;
            case "P":
                parsedProductType = "Paired Text";
                break;
        }
        return parsedProductType;
    }
}