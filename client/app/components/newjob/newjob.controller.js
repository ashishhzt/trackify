const SERVICE = new WeakMap();

class NewjobController {
  constructor($rootScope, AuthFactory, newJobService) {
    
    SERVICE.set(this, newJobService);
    this.newJob = [];
  }

    $onInit() {
      console.log('this.user injected into job component\'s bindings by ui-router\'s $resolve service', this.user)
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
}

export default NewjobController;
