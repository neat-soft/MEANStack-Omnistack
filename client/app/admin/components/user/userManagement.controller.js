'use strict';

angular.module('fsaApp')
  .controller('UserManageCtrl', function ($scope, User, socket, ngDialog, filterFilter) {
    $scope.userSearch = '';
    $scope.userCurrentPage = 1;
    $scope.users = User.query(function(users) {
      $scope.filteredUsers = users;
    });
    $scope.maxPage = 1;
    $scope.userLim = 2;
    socket.syncUpdates('users', $scope.users);
    $scope.userSearchTypes = [
      {name: 'Any', value: '$'},
      {name: 'Name', value: 'name'},
      {name: 'Email', value: 'email'},
      {name: 'Role', value: 'role'},
      {name: 'Academic Role', value: 'academicRole'}
    ];
    $scope.userSearchType = $scope.userSearchTypes[0].value;

    $scope.orderTypes = [
      {name: 'None', value: ''},
      {name: 'Name (A-Z)', value: 'name'},
      {name: 'Name (Z-A)', value:'-name'},
      {name: 'Last login Date (Recent First)', value: '-lastLogin'},
      {name: 'Last login Date (Recent Last)', value: 'lastLogin'},
    ];

    $scope.orderField = $scope.orderTypes[0].value;

    $scope.$watch('filteredUsers', function(filteredUsers) {
      if (filteredUsers) {
        var filterLen = filteredUsers.length;
        if (filterLen > 0) {
          $scope.userMaxPage = Math.ceil(filterLen/$scope.userLim);
        }
        else {
          $scope.userMaxPage = 1;
        }
      }
    });

    //Changes the page of the users.
    $scope.userPage = function(step) {
      var newPage = $scope.userCurrentPage + step;
      if ((newPage < 1 ) || (newPage > $scope.userMaxPage)) {
        return;
      }
      else {
        $scope.userCurrentPage = newPage;
      }
    };

    $scope.setFilteredUsers = function() {
      $scope.filteredUsers = $scope.users;
      if ($scope.filteredUsers) {
        var filterLen = $scope.filteredUsers.length;
        if (filterLen > 0) {
          $scope.userMaxPage = Math.ceil(filterLen/$scope.userLim);
        }
        else {
          $scope.userMaxPage = 1;
        }
      }
    };

    $scope.updateFilteredUsers = function() {
      var filt = {};
      filt[$scope.userSearchType] = $scope.userSearch;
      $scope.filteredUsers = filterFilter($scope.users, filt);
    };

    $scope.subjectString = function(subjects) {
      var subStr = '';
      if (subjects.length === 0) {
        subStr = 'None.';
      } else if (subjects.length === 1) {
        subStr = subjects[0].subjectName + '.';
      } else {
        for (var i = 0; i < subjects.length; i++) {
          subStr = subStr + subjects[i].subjectName + ', ';
        }
        subStr = subStr.substring(0, subStr.length-2) + '.';
      }
      return subStr;
    };

    // Add Subjects Taught
    $scope.addSubjectsTaughtModal = function (user) {
      ngDialog.open({
        template: 'app/admin/components/subjectsTaught/subjectsTaught.html',
        controller: 'SubjectsTaughtCtrl',
        scope: $scope,
        data: user
      });
    };

  });
