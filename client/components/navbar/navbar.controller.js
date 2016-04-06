'use strict';

angular.module('fsaApp')
  .controller('NavbarCtrl', function ($scope, $window, $location, Auth, User) {
    $scope.menu = [/*{
      'title': 'About',
      'link': 'about'
    },*/ {
      'title': 'Contact',
      'link': 'contact'
    }/*, {
      'title': 'Blog',
      'link': '/blog'
    }*/];
    $window.onresize = function() {
      $scope.isCollapsed = true;
    };
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isCollapsed = true;
    $scope.isAdmin = Auth.isAdmin;
    $scope.isTeacher = Auth.isTeacher;
    $scope.isStudent = Auth.isStudent;
    if ($scope.$root !== null) {
      if (!$scope.$root.userName) {
        if(Auth.isLoggedIn()) {
          User.get(function(response) {
            $scope.$root.userName = response.name;
            $scope.userName = response.name;
          });
        }
      }
      $scope.userName = $scope.$root.userName;
      $scope.$root.$watch('userName', function() {
        if ($scope.$root !== null) {
          $scope.userName = $scope.$root.userName;
        }
      });
    }
    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return $location.path().split('/')[1] === route;
    };
  });
