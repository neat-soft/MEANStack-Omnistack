'use strict';

angular.module('fsaApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/resources/:subject?/:resource?', {
        templateUrl: function(params){
          var url = 'app/resources/resources.html';
          if (params.subject) {
            if (params.resource) {
              url = 'app/resources/subjects/' + params.subject + '/' + params.resource + '.html';
            }
            else {
              url = 'app/resources/subjects/' + params.subject + '/' + params.subject + '.html';
            }
          }
          return url;
        },
        controller: 'ResourcesCtrl'
      });
  });
