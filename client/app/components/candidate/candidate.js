import angular from 'angular';
import uiRouter from 'angular-ui-router';
import candidateComponent from './candidate.component';

let candidateModule = angular.module('candidate', [
  uiRouter
])

.config(($stateProvider, $urlRouterProvider) => {
  "ngInject";

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('candidate', {
      url: '/candidate',
      template: '<candidate user="vm.auth.user"></candidate>'
    });
})
.component('candidate', candidateComponent);

export default candidateModule;
