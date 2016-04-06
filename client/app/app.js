'use strict';

angular.module('fsaApp', [
  'ngCookies',
  'ngResource',
  'ngAnimate',
  'ngSanitize',
  'ngRoute',
  'btford.socket-io',
  'ui.bootstrap',
  'ngTouch',
  'ngDialog',
  'ui.select',
  'timer',
  'angularSmoothscroll',
  'angularSpinner',
  'isteven-multi-select',
  'toastr',
  'ngCkeditor'
])
  .config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function (response) {
        if (response.status === 401) {
          $location.path('/login');
        }
        return $q.reject(response);
      }
    };
  })

  .run(function ($rootScope, $location, $window, Auth) {
    //Scroll to top on location change.
    $rootScope.$on('$locationChangeSuccess', function() {
                $window.scrollTo(0,0);
    });
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function (loggedIn) {
        $rootScope.showChatBox = loggedIn;
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  })

  .config(function(toastrConfig) {
    angular.extend(toastrConfig, {
      autoDismiss: true,
      positionClass: 'toast-bottom-left',
      timeOut: 3000,
      extendedTimeOut: 1000
    });
  })

  .config(['usSpinnerConfigProvider', function (usSpinnerConfigProvider) {
    var opts = {
      lines: 13, // The number of lines to draw
      length: 6, // The length of each line
      width: 2, // The line thickness
      radius: 7, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 73, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: true, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '50%', // Top position relative to parent
      left: '50%' // Left position relative to parent
    };
    usSpinnerConfigProvider.setDefaults(opts);
  }]);
