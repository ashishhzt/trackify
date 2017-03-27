const SERVICE = new WeakMap();

class NewjobController {
  constructor($rootScope, AuthFactory, newJobService, $state) {
    'ngInject'

    this.$state = $state;
    
    SERVICE.set(this, newJobService);
    this.newJob = [];
  }

    $onInit() {
      console.log('this.user injected into job component\'s bindings by ui-router\'s $resolve service', this.user)

      this.getClients();
    }

    getClients() {
      SERVICE.get(this).getClients()
        .then(clients => {
          this.clients = clients;
        })
    }

    addNewJob(newJob) {
      console.log(newJob);

      SERVICE.get(this).createNewJob(newJob).then(response => {
        console.log(response.message); 
      }, error => {
        this.newJob = [];
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

export default NewjobController;
