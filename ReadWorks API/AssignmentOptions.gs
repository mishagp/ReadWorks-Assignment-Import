class ReadWorksAssignmentOptions {
    constructor(data) {
        this.meaningMapper = data['mm'];
        this.assignedArticle = data['a'];
        this.questionSets = data['qs'];
        this.ell = data['ell'];
        this.expressQuestionsets = data['expressqs'];
        this.requireHighlighting = data['h'];
        this.wordDetective = data['wd'];
        this.assignedEbook = data['ebook'];
        this.assignedAudio = data['au'];
        this.assignedVocabulary = data['v'];
        this.challengeArticles = data['challenge'];
        this.supportArticles = data['support'];
        this.bookOfKnowledge = data['bok'];
        this.stepReads = data['sr'];
    }
}