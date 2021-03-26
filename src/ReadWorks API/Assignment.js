class ReadWorksAssignment {
    constructor(data, rwClass) {
        this.rwClass = rwClass;
        this.id = data['aid'];
        this.studentsInProgressCount = data['ka'];
        this.productID = data['p'];
        this.status = data['s'];
        this.type = data['t'];
        this.dueDate = data['edd'];
        this.owner = data['owner'];
        this.options = new ReadWorksAssignmentOptions(data['opts']);
        this.metadata = new ReadWorksAssignmentMetadata(data['pmd']);
        if (this.metadata.productType == "Article-A-Day") {
            this.dueDate = data['ed'];
        }
        this.submittedAssignments = [];
    }
}