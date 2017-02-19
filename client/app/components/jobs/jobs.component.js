// import template from './jobs.jade';
import template from './jobs.html';
import controller from './jobs.controller';
import './jobs.sass';

let jobsComponent = {
  restrict: 'E',
  bindings: {
    user: '<'
  },
  template,
  controller,
  controllerAs: 'vm'
};

export default jobsComponent;