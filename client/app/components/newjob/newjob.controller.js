const SERVICE = new WeakMap();
const TRACKER_FORMATS = [{
    name: 'Name',
    key: 'candidateName',
    select: true
}, {
    name: 'Mail ID',
    key: 'candidateEmail',
    select: true
}, {
    name: 'Mobile',
    key: 'candidateContact',
    select: true
}, {
    name: 'Experience',
    key: 'experience',
    select: true
}, {
    name: 'Company',
    key: 'employer',
    select: false
}, {
    name: 'Designation',
    key: 'designation',
    select: false
}, {
    name: 'College',
    key: 'college',
    select: false
}, {
    name: 'Key Skills',
    key: 'key_skills',
    select: true
}, {
    name: 'CTC (lakhs)',
    key: ['ctcFixed', 'ctcVariable', 'ctcEsops'],
    select: true
}, {
    name: 'ECTC (lakhs)',
    key: ['eCTCFixed', 'eCTCVariable', 'eCTCEsops'],
    select: true
}, {
    name: 'Notice Period (days)',
    key: 'noticePeriod',
    select: false
}, {
    name: 'Candidate serving notice?',
    key: 'serveNotice',
    select: false
}, {
    name: 'Job Location',
    key: 'location',
    select: true
}]

class NewjobController {
    constructor($rootScope, AuthFactory, newJobService, jobsService, $state) {

        this.$state = $state;
        this.jobsService = jobsService;

        SERVICE.set(this, newJobService);
        this._initNewJob();

    }

    $onInit() {
        console.log('this.user injected into job component\'s bindings by ui-router\'s $resolve service', this.user)
        this.getClients();
        this.getAllRecruiters();

        this.initSelect2Dropdowns();

        this.trackerFormats = [...TRACKER_FORMATS];
    }

    initSelect2Dropdowns() {
        $("#myid1").select2({ tags: true });
        $("#myid2").select2({ tags: true });
        $("#myid3").select2({ maximumSelectionLength: 2 });
        $("#myid4").select2({ tags: true })
        $("#myidMandatorySkills").select2({ tags: true })
        $("#myidEitherOrSkills").select2({ tags: true })

    }

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

        if (!this._doValidateTrackers(this.trackerFormats)) {
            alert('Please select valid Tracker Format');
            return;
        }

        // Filtering the selected format's keys and forming a flattened array
        this.newJob.trackerFormats = this._parseTrackerFormat(this.trackerFormats);


        // Disabling coverting JSON to FormData
        // let fd = new FormData();
        // for (let item in this.newJob) {
        //     fd.append(item, this.newJob[item]);
        // }

        if (this.ctcFunction()) {

        } else{
            SERVICE.get(this).createNewJob(this.newJob).then(response => {
                alert(`New Job: ${this.newJob.clientName} - ${this.newJob.designation} successfully created`)
                this._initNewJob();
                this.$state.go('jobs')
            }, error => {
                this._initNewJob();
            });
        }


    }

    // To make custom-select2 directive work properly with ng-model value
    _initNewJob() {
        this.newJob = {
            designation: '',
            primarySkill: ''
        };
    }

    createNewClient(e) {
        if (!this.newClient ||
            !this.newClient.clientName ||
            !this.newClient.clientEmail ||
            !this.newClient.locations ||
            !this.newClient.locations.length ||
            !this.newClient.address ||
            !this.newClient.address.length ||
            !this.newClient.otherInfo) {
            alert('Fill the Mandatory feilds');
            e.preventDefault();
            e.stopPropagation();

            return;
        }


        if (this.newClient.clientName && this.newClient.clientEmail && this.newClient.locations.length && this.newClient.address.length && this.newClient.otherInfo) {
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

    editTrackerFormat(e) {
        if (!this._doValidateTrackers(this.trackerFormats)) {
            // Since trackers are in-validate, event is stopped and alert message is thrown
            e.preventDefault();
            e.stopPropagation();
            alert('Please select valid Tracker Format');
        }

        console.log('editTrackerFormat', this.trackerFormats);
    }

    // Add custom Tracker validation logic here
    _doValidateTrackers(trackers) {
        if (!trackers) return false;

        let selectedTrackers = trackers.filter(tracker => tracker.select);
        return selectedTrackers.length > 0
    }

    _parseTrackerFormat(trackers) {
        let _trackers = trackers
            .filter(tracker => tracker.select)
            .map(selectedTracker => selectedTracker.key);

        return [].concat(..._trackers);
    }

    resetForm() {
        this.newClient.clientName = null;
        this.newClient.clientEmail = null;
        this.newClient.locations.length = null;
        this.newClient.address.length = null;
        this.newClient.otherInfo = null;
    }
    arrayDuplicate() {
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
        if (this.newJob.minCtc > this.newJob.maxCtc || this.newJob.minExp > this.newJob.maxExp) {
            alert("CTC and Exp should always lesser than Maximum");
            return true
        }
        return false
    }

    locationChange() {

        if (this.newClient.locations == "" || this.newClient.address == "") {
            this.newClient.locations = [];
            this.newClient.address = [];
        }
    }




}

NewjobController.$inject = ["$rootScope", "AuthFactory", "newJobService", "jobsService", "$state"]

export default NewjobController;
