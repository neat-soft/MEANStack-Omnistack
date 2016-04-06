'use strict';

angular.module('fsaApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/terms', {
        templateUrl: 'app/terms/terms.html',
        controller: 'TermsCtrl'
      });
  });
