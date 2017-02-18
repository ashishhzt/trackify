import angular from 'angular';
import uiRouter from 'angular-ui-router';
import jobsComponent from './jobs.component';

let jobsModule = angular.module('jobs', [
  uiRouter
])

.component('jobs', jobsComponent);

export default jobsModule;
