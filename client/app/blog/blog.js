'use strict';

angular.module('fsaApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/blog', {
        redirectTo: function() {
          window.location = '/blog'
        }
      });
  });
