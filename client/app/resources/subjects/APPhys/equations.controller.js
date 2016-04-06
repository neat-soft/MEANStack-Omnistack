'use strict';

angular.module('fsaApp')
  .controller('ResourcesAPPhysEquationsCtrl', function ($scope, ngDialog, $http, toastr) {
    $scope.equationList = []
    $http.get('assets/jsons/APPhysEquations.json').success(function(data) {
      $scope.equationList = data;
    }).error(function(err){
      //toastr.error(err)
    });
});
