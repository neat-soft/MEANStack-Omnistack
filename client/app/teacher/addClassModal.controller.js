'use strict';

angular.module('fsaApp')
  .controller('TeacherAddClassCtrl', function ($scope, $http, toastr) {

    $http.get('/api/settings/byName/subjects')
      .success(function(data) {
        console.log(data.info);
        $scope.subjects = data.info.subjects;
        $scope.newClassroom.subject = $scope.subjects[0].dbName;
      });

    $scope.addClass = function(newClass) {
      if (newClass.studentString) {
        newClass.unclaimedStudents = newClass.studentString.split(',');
        for (var i = 0; i < newClass.unclaimedStudents.length; i++) {
          newClass.unclaimedStudents[i] = newClass.unclaimedStudents[i].trim();
        }
      } else {
        newClass.unclaimedStudents = [];
      }
      newClass.classAvg = 'N/A';
      delete newClass.studentString;
      $http.post('api/classrooms/', newClass)
        .success(function(newClass) {
          $scope.closeThisDialog(newClass);
        }).error(function(err) {
          toastr.error(err);
        });
    };

  });
