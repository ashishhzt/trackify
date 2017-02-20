import angular from 'angular';
import uiRouter from 'angular-ui-router';
import dashboardComponent from './dashboard.component';

let dashboardModule = angular.module('dashboard', [
  uiRouter
])

.config(($stateProvider, $urlRouterProvider) => {
  "ngInject";

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('dashboard', {
      url: '/dashboard',
      template: '<dashboard user="vm.auth.user"></dashboard>'
    });
})
.component('dashboard', dashboardComponent);

export default dashboardModule;
