import angular from 'angular';
import Home from './home/home';
import Login from './login/login';
import Jobs from './jobs/jobs'

let componentModule = angular.module('app.components', [
  Home.name,
  Login.name,
  Jobs.name
]);

export default componentModule;
