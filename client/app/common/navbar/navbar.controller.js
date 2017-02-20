class NavbarController {
  	constructor(AuthFactory, $state) {
	  	//Dependencies
	  	this.AuthFactory = AuthFactory;
    	this.$state = $state;
  	}

    logout () {
      	this.AuthFactory.logout()
      		.then(message => {
                (message) ? this.error = message : this.$state.go('login');
            });
    }
};

NavbarController.$inject = ['AuthFactory', '$state']

export default NavbarController;