'use strict';
angular.module('fsaApp')
  .filter('startAt', function() {
    return function(input, start) {
        start = +start; //parse to int
        if (!input) {
          return [];
        }
        return input.slice(start);
    };
});
angular.module('fsaApp')
  .controller('AdminCtrl', function ($scope, $location, $timeout, $window, $http, ngDialog, Auth, User, socket) {
    $scope.trackerSet = false;
    $scope.user = User.get();
    Auth.is('admin', function(match) {
      if (!match) {
        $location.path('/');
      }
    });
    //GET roles from server
    $http.get('api/users/roles').success(function(response){
      $scope.roles = response;
    });
    // Use the User $resource to fetch all users
    $scope.adminComponentNames = [
      'user',
      'questions',
      'survey',
      'betaKey',
      'couponManagement',
      'chatroom',
      'chatarchive',
      'blockuser',
      'exams',
      'accountTracker',
      'notificationToggle'
    ];

    $scope.adminComponents = {
        user: 'app/admin/components/user/userManagement.html',
        questions: 'app/admin/components/questions/questionManagement.html',
        survey: 'app/admin/components/survey/surveyManagement.html',
        betaKey: 'app/admin/components/betaKey/betaKeyManagement.html',
        couponManagement: 'app/admin/components/couponManagement/couponManagement.html',
        chatroom: 'app/admin/components/chatroom/chatroom.html',
        chatarchive: 'app/admin/components/chatarchive/chatarchive.html',
        blockuser: 'app/admin/components/blockuser/blockuser.html',
        exams: 'app/admin/components/exams/examManagement.html',
        accountTracker: 'app/admin/components/accountTracker/accountTracker.html',
        notificationToggle: 'app/admin/components/notificationToggle/notificationToggle.html',
      };

    $scope.show = {};
    $scope.showComponent = function(name) {

    }


    $scope.resetDate = function() {
      $http.post('auth/resetStatDate', {date: $scope.dt}).success(function(data){
        console.log(data);
        var animatedDOM = angular.element('.animate-me');
        animatedDOM.css('opacity', 1);
        $timeout(function(){animatedDOM.css('opacity', 0);}, 1000 );
      });
    };

    $scope.addUserModal = function() {
      ngDialog.open({
        template: 'components/addUser/addUser.html',
        controller: 'AddUserCtrl',
        scope: $scope
      });
    };

    $scope.modifyRole = function(user) {
      User.changeRole({ id: user._id }, { id: user._id, newRole: user.newRole });
      user.role = user.newRole;
      user.roleChanging = false;
    };

    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };

    $scope.parseDate = function(date) {
      if (date === null) {
        return 'Never';
      }
      else {
        var dateObj = new Date(Date.parse(date));
        return dateObj.toDateString();
      }
    };

    //Datepicker
    $scope.dt = new Date();
    $http.get('auth/resetStatDate').success(
      function(data) {
        $scope.dt = data;
      }
    );
    $scope.format = 'dd-MMMM-yyyy';

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened = true;
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('users');
    });
  });
