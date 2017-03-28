import angular from 'angular';
import uiRouter from 'angular-ui-router';
import newjobComponent from './newjob.component';
import jobsService from '../jobs/jobs.service';
import newjobService from './newjob.service';

let newjobModule = angular.module('newjob', [
  uiRouter
])

.config(($stateProvider, $urlRouterProvider) => {
  "ngInject";

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('newjob', {
      url: '/newjob',
      template: '<newjob user="vm.auth.user"></newjob>'
    });
})

.service('newJobService', newjobService)

.factory('jobsService', jobsService.getInstance)

.component('newjob', newjobComponent);

export default newjobModule;
