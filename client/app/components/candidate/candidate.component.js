
import template from './candidate.html';
import controller from './candidate.controller';
import './candidate.sass';

let candidateComponent = {
  restrict: 'E',
  bindings: {
    user: '<'
  },
  template,
  controller,
  controllerAs: 'vm'
};

export default candidateComponent;