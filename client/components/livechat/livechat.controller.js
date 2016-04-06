'use strict';

angular.module('fsaApp')
  .controller('LivechatCtrl', function ($scope, $interval, $location, $rootScope) {
    var routeRegex = /account|setting|admin|teacher/;
    var promise;
    var checkLocationAndHideLivechat = function () {
      $interval.cancel(promise);
      var fullChat = angular.element('#livechat-full');
      var smallChat = angular.element('#livechat-compact-container');
      if (Object.keys(fullChat).length <= 2 || Object.keys(smallChat) <= 2) {
        // livechat has not finished loading
        promise = $interval(checkLocationAndHideLivechat, 100);
      } else {
        promise = $interval(checkLocationAndHideLivechat, 100);
        // Hide livechat if it matches route regex, show it otherwise
        if (routeRegex.test($location.url())){
          fullChat.css('visibility', 'hidden');
          smallChat.css('visibility', 'hidden');
        } else {
          fullChat.css('visibility', 'visible');
          smallChat.css('visibility', 'visible');
        }
      }
    }
    $rootScope.$on('$locationChangeSuccess', function(event) {
      checkLocationAndHideLivechat();
    });
  });
