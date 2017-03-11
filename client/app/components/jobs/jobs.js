import angular from 'angular';
import uiRouter from 'angular-ui-router';
import jobsComponent from './jobs.component';
import service from './jobs.service';
import shareData from './jobs.service.data'
import fileModelDirective from './jobs.directive';
import trustAsResourceUrlFilter from './jobs.filter';

let jobsModule = angular.module('jobs', [
  uiRouter
])

.config(($stateProvider, $urlRouterProvider) => {
  "ngInject";

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('jobs', {
      url: '/jobs',
       resolve: {
           authuser: function (AuthFactory) {
             'ngInject';
             return AuthFactory.getUser()
               .then(() => AuthFactory.auth.user)
           }
         },
         template: '<jobs user="$resolve.authuser"></jobs>'
    });
})
.component('jobs', jobsComponent)
.factory('jobsService', service.getInstance)
.directive('fileModel', fileModelDirective)
.service('shareData', shareData)
.filter('trustAsResourceUrl', trustAsResourceUrlFilter);

export default jobsModule;
