'use strict';

angular.module('fsaApp')
  .controller('ResourcesAPPhysCtrl', function ($scope, ngDialog, $routeParams) {
    $scope.subject = $routeParams.subject;
    $scope.resources = [
      {
        name: 'Equation Sheet',
        url: '/resources/APPhys/equations',
        description: 'A few equations that you might be able to use on the exam, organized by topic.'
      }
    ];

});
