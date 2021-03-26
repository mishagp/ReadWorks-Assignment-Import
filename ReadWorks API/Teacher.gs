class ReadWorksTeacher {
    constructor(data) {
        this.uid = data['uid'];
        this.lastName = data['l'];
        this.firstName = data['f'];
        this.email = data['e'];
        this.username = data['u'];
    }

    getName() {
        return this.firstName + " " + this.lastName;
    }
}