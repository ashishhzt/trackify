const HTTP = new WeakMap();

class newJobService {

    constructor($http) {
        HTTP.set(this,$http);
    }

    createNewJob(formData) {
        return HTTP.get(this).post("/api/newjob/createJob", formData).then(result => result.data);
    }

    static getInstance($http) {
        return new newJobService($http);
    }
}

newJobService.getInstance.$inject = ['$http'];

export default newJobService