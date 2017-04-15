import angular from 'angular';
import uiRouter from 'angular-ui-router';
import candidateComponent from './candidate.component';
import service from './candidate.service';
import shareData from '../jobs/jobs.service.data'
import mailer from '../mailer/mailer.controller'
import trustAsResourceUrlFilter from './candidate.filter';

let candidateModule = angular.module('candidate', [
  uiRouter
])

.config(($stateProvider, $urlRouterProvider) => {
  "ngInject";

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('candidate', {
      url: '/candidate',
      resolve: {
        authuser: function (AuthFactory) {
          'ngInject';
          return AuthFactory.getUser()
            .then(() => AuthFactory.auth.user)
        }
      },
      template: '<candidate user="$resolve.authuser"></candidate>'
    });
})
.component('candidate', candidateComponent)
.factory('candidateService', service.getInstance)
.service('shareData', shareData)
.service('mailer', ['$http', mailer])
.filter('trustAsResourceUrl', trustAsResourceUrlFilter);

export default candidateModule;
