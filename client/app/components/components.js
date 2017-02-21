import angular from 'angular';
import Home from './home/home';
import Login from './login/login';
import Jobs from './jobs/jobs';
import Candidate from './candidate/candidate';
import Dashboard from './dashboard/dashboard';

let componentModule = angular.module('app.components', [
  Home.name,
  Login.name,
  Jobs.name,
  Candidate.name,
  Dashboard.name
]);

export default componentModule;
