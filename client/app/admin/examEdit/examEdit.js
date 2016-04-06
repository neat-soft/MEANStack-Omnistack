'use strict';

angular.module('fsaApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/admin/examEdit/:id', {
        templateUrl: 'app/admin/examEdit/examEdit.html',
        controller: 'ExamEditCtrl'
      });
  });
