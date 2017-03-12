class AppController {
	constructor(AuthFactory) {
		this.auth = null;
		this.AuthFactory = AuthFactory;
	}

	$onInit() {
      	this.auth = this.AuthFactory.getLoggedInUser();
      	if (this.AuthFactory.isAuthenticated()) this.AuthFactory.getUser();
      	
		// TODO: Set this.auth with resolved user info
		// if (this.AuthFactory.isAuthenticated()) {
		// 	this.AuthFactory.getUser()
		// 	.then(() => {
		// 		this.auth = this.AuthFactory.getLoggedInUser();
		// 		debugger
		// 	});
		// }
    }
};

AppController.$inject = ['AuthFactory'];

export default AppController;