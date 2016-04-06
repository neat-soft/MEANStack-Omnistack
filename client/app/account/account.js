'use strict';

angular.module('fsaApp')
  .config(function($routeProvider) {
    $routeProvider
      .when('/test', {
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl'
      });
  });

angular.module('fsaApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .when('/signup/key/:key/:name?/:email?', {
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl'
      })

      //Non-beta Site
      .when('/signup', {
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl'
      })
      /*
      //Beta Site
      .when('/signup', {
        templateUrl: 'app/account/signup/beta/beta.html',
        controller: 'BetaSignupCtrl'
      })
      */

      .when('/settings', {
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      })
      .when('/forgot', {
        templateUrl: 'app/account/forgot/forgot.html',
        controller: 'ForgotCtrl'
      })
      .when('/reset/token/:token', {
        templateUrl: 'app/account/reset/reset.html',
        controller: 'ResetCtrl'
      })
      .when('/account', {
        templateUrl: 'app/account/account/account.html',
        controller: 'AccountCtrl'
      })
      .when('/account/:subjectname/:examnumber/:section', {
        templateUrl: 'app/account/exam/exam.html',
        controller: 'ExamCtrl'
      });
  });
