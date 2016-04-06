'use strict';

angular.module('fsaApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/pricing/couponCode/:couponCode', {
        templateUrl: 'app/pricing/pricing.html',
        controller: 'PricingCtrl',
        authenticate: true
      })
      .when('/pricing', {
        templateUrl: 'app/pricing/pricing.html',
        controller: 'PricingCtrl',
        authenticate: true
      });
  });
