// import template from './newjob.jade';
import template from './newjob.html';
import controller from './newjob.controller';
import './newjob.sass';

let newjobComponent = {
  restrict: 'E',
  bindings: {
  	user: '<'
  },
  template,
  controller,
  controllerAs: 'vm'
};

export default newjobComponent;