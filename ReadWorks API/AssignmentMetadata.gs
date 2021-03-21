class ReadWorksAssignmentMetadata {
    constructor(data) {
        this.wordCount = data['mm'];
        this.thumbnailUrl = data['img'];
        this.domains = data['s'];
        this.productType = this.parseProductType(data['pt']);
        this.textType = data['t'];
        this.lexileCodes = data['lc'];
        this.grades = this.parseGradeLevels(data['g']);
        this.title = data['title'];
    }

    parseGradeLevels(grades) {
        var parsedGradeLevel = ""
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
        ;
        return parsedGradeLevel;
    }

    parseProductType(pt) {
        var parsedProductType = ""
        switch (pt) {
            case "A":
                parsedProductType = "Reading Passages";
                break;
            case "AD":
                parsedProductType = "Article-A-Day";
                break;
            case "AD":
                parsedProductType = "Paired Text";
                break;
        }
        return parsedProductType;
    }
}