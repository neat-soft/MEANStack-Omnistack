'use strict';

angular.module('fsaApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/privacy', {
        templateUrl: 'app/privacy/privacy.html',
        controller: 'PrivacyCtrl'
      });
  });
