class ReadWorksAssignment {
    constructor(data) {
        this.id = data['aid'];
        this.studentsInProgressCount = data['ka'];
        this.productID = data['p'];
        this.status = data['s'];
        this.type = data['t'];
        this.dueDate = data['edd'];
        this.owner = data['owner'];
        this.options = new ReadWorksAssignmentOptions(data['opts']);
        this.metadata = new ReadWorksAssignmentMetadata(data['pmd']);
        this.submittedAssignments = [];
    }
}