const SERVICE = new WeakMap();

class NewjobController {
  constructor($rootScope, AuthFactory, newJobService, jobsService, $state) {

    this.$state = $state;
    this.jobsService = jobsService;
    
    SERVICE.set(this, newJobService);
    this.newJob = {};
  }

    $onInit() {
      console.log('this.user injected into job component\'s bindings by ui-router\'s $resolve service', this.user)

      this.getClients();
      this.getAllRecruiters();
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

      SERVICE.get(this).createNewJob(this.newJob).then(response => {
        alert(`New Job: ${this.newJob.clientName} - ${this.newJob.designation} successfully created`)
        this.newJob = {};
      }, error => {
        this.newJob = {};
        console.log(error);
      });
    }

    createNewClient() {
      SERVICE.get(this).createClient(this.newClient)
        .then(res => {
          if (res.message === 'ADD SUCCESS') {
            alert('Client successfully created');
            this.getClients();
          }
          else if (res.message === 'ADD FAILURE') alert('Client creation failed')
          else this.$state.go('login');
        })
    }
}

NewjobController.$inject = ["$rootScope", "AuthFactory", "newJobService", "jobsService", "$state"]

export default NewjobController;
