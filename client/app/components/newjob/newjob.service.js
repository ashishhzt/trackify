const HTTP = new WeakMap();

class newJobService {

    constructor($http) {
        'ngInject';

        HTTP.set(this,$http);
    }

    createNewJob(formData) {
        return HTTP.get(this).post("/api/newjob/createJob", formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(result => result.data);
    }

    getClients() {
        return HTTP.get(this).post("/api/newjob/getclients", {}).then(result => result.data);
    }

    createClient(data) {
        return HTTP.get(this).post("/api/newjob/createClient", data)
            .then(result => result.data);
    }

    static getInstance($http) {
        return new newJobService($http);
    }
}

export default newJobService