'use strict';

angular.module('fsaApp')
  .controller('StudentClassroomPeerGradeModalCtrl', function ($scope, $http, ngDialog, toastr, $routeParams) {
    var getResponse;
    var peerURL = 'api/classrooms/peer/' + $scope.ngDialogData.classCode + '/' + $scope.ngDialogData.assignmentCode;
    $http.get(peerURL)
      .success(function(response) {
        console.log(response);
        getResponse = response;
        $scope.responses = response.responses;
        $scope.questions = response.questions;
      }).error(function(err) {
        toastr.error(err);
        $scope.closeThisDialog();
      });
    $scope.grades = {};
    $scope.submitPeerGrade = function() {
      var graded = [];
      for (var i = 0; i < $scope.questions.length; i++) {
        graded.push({
          questionId: $scope.questions[i]._id,
          grade: $scope.grades[$scope.questions[i]._id]
        });
      }
      var toPost = {
        studentId: getResponse.studentId,
        graded: graded
      };
      $http.post(peerURL, toPost)
        .success(function(classroom) {
          console.log(classroom);
          $scope.closeThisDialog(classroom);
        }).error(function(e) {
          toastr.error(e);
        });
    };
  });
