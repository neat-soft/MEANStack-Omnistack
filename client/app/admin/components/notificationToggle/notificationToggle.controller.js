'use strict';

angular.module('fsaApp')
  .controller('NotificationToggleCtrl', function ($scope, $http, socket, toastr) {
    $scope.show = false;
    $scope.isDisabled = false;

    // Fetch Notification Status
    $http.get('/api/settings/byName/adminChatNotification').success(function (res) {
      $scope.settings = [res]; //push in array as socket.syncUpdates requires array.
      $scope.show = true;
      socket.syncUpdates('settings', $scope.settings, function (action, doc) {
        if (doc.name === 'adminChatNotification') {
          $scope.settings = [doc]; //push in array as socket.syncUpdates requires array.
          toastr.warning('Chat Notifications Settings Updated!', 'Attention');
        }
      });
    }).error(function (err) {
      $scope.show = true;
    });

    //toggle request
    $scope.toggleStatus = function (active) {
      $scope.isDisabled = true;
      $http.put('/api/settings/byName/adminChatNotification', {info: {active: active}}).success(function (res) {
        $scope.isDisabled = false;
      });
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('settings');
    });
  }).config(function (toastrConfig) {
    angular.extend(toastrConfig, {
      autoDismiss: false,
      timeOut: 0
    });
  });
