import angular from 'angular';
import uiRouter from 'angular-ui-router';
import newjobComponent from './newjob.component';
import fileModelDirective from '../jobs/jobs.directive';
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

.component('newjob', newjobComponent)

.directive('fileModel', fileModelDirective)

.directive('customSelect2', function($timeout) {
    'ngInject'
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            scope.$watch(attrs.ngModel, function(value) {

                if (angular.isUndefined(value) && element.select2('val')) {
                    controller.$setViewValue(element.select2('val'));
                    controller.$commitViewValue();
                }
            });

            // element.bind('change', function() {
            //   var value = element.select2('val');
            //   controller.$setViewValue(value);
            // });

            // $timeout(function() {
            //   element.select2({
            //     tags: []
            //   });
            // });
        }
    };
});

export default newjobModule;
