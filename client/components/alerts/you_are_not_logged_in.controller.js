'use strict';

angular.module('fsaApp')
  .controller('YouAreNotLoggedInCtrl', function ($scope, ngDialog, $http, Auth, $location) {
    $scope.exists = false;
    $http.post('/api/users/exists', {
      email: $scope.ngDialogData.email
    }).success(function (response) {
      if (response === true) {
        // A user with this email already exists. Please log in
        $scope.exists = true;
      } else if (response === false) {
        // It seems like you don't have an account. Log in socially or continue to automatically create an account
        $scope.exists = true;
      } else {
        alert('An error has occurred')
      }
    });
    $scope.createCustomerAccount = function() {
      /* Uncomment the below lines for user to have instant access from their paypal email */
      // $http.post('/api/users/customer', {
      //   email: $scope.ngDialogData.email,
      //   subjects: $scope.ngDialogData.subjects
      // })
      // .success(function(response) {
      //   // redirect to account page w/ exams
      //   Auth.login({
      //     email: $scope.ngDialogData.email,
      //     password: response.password
      //   }).then(function () {
      //     $location.path('/')
      //   }).catch(function (err) {
      //     alert(err.message);
      //   })
      //   // alert(Object.keys(response))
      //   ngDialog.closeAll();
      // })
      // alert('new account about to be created for ' + $scope.ccform.emailAddress + ' with access to ' + $scope.ngDialogData);
    };
    $scope.login = function () {
      // Allow the user that logs in to have an upgraded account
    };
  });
