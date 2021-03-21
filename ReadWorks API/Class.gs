class ReadWorksClass {
    constructor(data) {
        this.classCode = data['cc'];
        this.uid = data['uid'];
        this.createdAt = data['c'];
        this.s = data['s'];
        this.as = data['as'];
        this.rt = data['rt'];
        this.g = data['g'];
        this.w = data['w'];
        this.studentUids = data['z'];
        this.students = [];
        this.assignments = [];
        this.name = data['n'];
    }
}