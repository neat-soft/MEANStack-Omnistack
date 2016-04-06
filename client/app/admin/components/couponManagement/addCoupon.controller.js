'use strict';

angular.module('fsaApp')
  .controller('AddCouponCtrl', function ($scope, $window, $http, Auth, ngDialog) {

    $scope.currentUser = Auth.getCurrentUser();

    var date = new Date();
    $scope.minDate = date.setDate((new Date()).getDate() + 1);

    $scope.openCouponDatePicker = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.couponDatePickerOpened = true;
    };

    $scope.addNewCoupon = function (form) {
      if (form.$valid) {
        $http.post('/api/coupons', $scope.coupon);
        ngDialog.close();
      }
    };
  });
