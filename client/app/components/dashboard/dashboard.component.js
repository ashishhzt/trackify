
import template from './dashboard.html';
import controller from './dashboard.controller';
import './dashboard.sass';

let dashboardComponent = {
  restrict: 'E',
  bindings: {
    user: '<'
  },
  template,
  controller,
  controllerAs: 'vm'
};

export default dashboardComponent;