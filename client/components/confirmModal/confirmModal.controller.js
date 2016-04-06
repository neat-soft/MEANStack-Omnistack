'use strict';

angular.module('fsaApp')
  .controller('ConfirmModalComponentCtrl', function ($scope) {
    $scope.modalData = $scope.ngDialogData;
    if ($scope.ngDialogData) {
      $scope.message = $scope.ngDialogData.message;
    }
    $scope.confirm = function() {
      $scope.closeThisDialog(true);
    };
    $scope.refute = function() {
      $scope.closeThisDialog(false);
    };
});
