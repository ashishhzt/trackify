const SERVICE = new WeakMap();

class NewjobController {
    constructor($rootScope, AuthFactory, newJobService, jobsService, $state) {

        this.$state = $state;
        this.jobsService = jobsService;

        SERVICE.set(this, newJobService);
        this.newJob = {};

        // $rootScope.$on("CallParentMethod", function() {
        //     this.parentmethod();
        // });

        // this.parentmethod();
    }

    $onInit() {
            console.log('this.user injected into job component\'s bindings by ui-router\'s $resolve service', this.user)
            this.getClients();
            this.getAllRecruiters();

        }
        // parentmethod() {

    // }
    getAllRecruiters() {
        this.jobsService.getAllRecruiters()
            .then(recruiters => {
                this.recruiters = recruiters.data;
            })
    }

    getClients() {
        SERVICE.get(this).getClients()
            .then(clients => {
                this.clients = clients;
            })
    }

    addNewJob(e, form) {
        console.log("APPLY")
        e.preventDefault();
        e.stopPropagation();


        // form.$error seems to be not working properly.
        // hence we checking for all model validator inside form model manually
        // TODO: Debug and find why form being set as $invalid all the time

        let formValid = true;
        angular.forEach(form, (value, key) => {
            if (key.indexOf('$') !== -1) return;
            if (value.$invalid) formValid = false;
        })

        if (!formValid) {
            alert('Please fill the mandatory fields')
            return;
        }

        if (this.ctcFunction()) {

        } else {
            SERVICE.get(this).createNewJob(this.newJob).then(response => {
                alert(`New Job: ${this.newJob.clientName} - ${this.newJob.designation} successfully created`)
                this.newJob = {};
                window.location.href = "/jobs"
            }, error => {
                this.newJob = {};
                console.log(error);
            });
        }


    }

    createNewClient(e) {

        if (this.newClient.clientName == undefined || !this.newClient.clientEmail || !this.newClient.locations || !this.newClient.address || !this.newClient.otherInfo) {
            alert('Fill the Mandatory feilds');
            e.preventDefault();
            e.stopPropagation();
            this.alertChange();
            return;
        }

        if (this.newClient.clientName && this.newClient.clientEmail && this.newClient.locations && this.newClient.address && this.newClient.otherInfo) {
            if (this.arrayDuplicate()) {
                alert('Name already registered');

                e.preventDefault();
                e.stopPropagation();
            } else {
                SERVICE.get(this).createClient(this.newClient)
                    .then(res => {
                        if (res.message === 'ADD SUCCESS') {
                            alert('Client successfully created');
                            this.getClients();
                            this.resetForm();
                        } else if (res.message === 'ADD FAILURE') alert('Client creation failed')
                        else this.$state.go('login');
                    })
            }
        }


    }
    resetForm() {
        this.newClient.clientName = null;
        this.newClient.clientEmail = null;
        this.newClient.locations = [];
        this.newClient.address = null;
        this.newClient.otherInfo = null;
    }
    arrayDuplicate() {
        console.log("CLIENTS", this.clients)
        if (this.clients.find(i => i.clientName === this.newClient.clientName)) {
            return true
        }
        return false
            // for (var i = 0; i <= this.clients.length; i++) {
            //     try {
            //         if (this.clients[i].clientName === this.newClient.clientName) {
            //             return true
            //         }
            //     }
            //     catch(err){
            //         console.log("Log ERR",err)
            //     }    

        // }
        // return false
    }
    ctcFunction() {
        console.log("CTC", this.newJob)
        if (this.newJob.minCtc > this.newJob.maxCtc || this.newJob.minExp > this.newJob.maxExp) {
            console.log("Minimum")
            alert("Minimum CTC and Exp should always lesser than Maximum");
            return true
        }
        return false
    }

    alertChange() {
        if (this.newClient.locations == '') {
            alert('Fill the Mandatory feilds');
        }
    }

}

NewjobController.$inject = ["$rootScope", "AuthFactory", "newJobService", "jobsService", "$state"]

export default NewjobController;
