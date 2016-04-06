'use strict';

angular.module('fsaApp')
  .controller('ExamEditCtrl', function ($scope, $http, $routeParams, toastr, $window) {
    $scope.examId = $routeParams.id;

    $scope.exam = undefined;

    $scope.changed = false;

    $http.get('/api/exams/' + $scope.examId).success(function(data) {
      $scope.exam = data;
    });

    $scope.delQuestion = function(question, part) {
      if (question.editing) {
        question.editing = false;
      }
      var fullPart = 'part' + part.toString();
      console.log(question._id);
      console.log($scope.exam.section1[fullPart].fullQuestions);
      var IDindex = $scope.exam.section1[fullPart].questionIds.indexOf(question._id);
      console.log('index is:' + IDindex.toString());
      $scope.exam.section1[fullPart].questionIds.splice(IDindex, 1);
      $scope.exam.section1[fullPart].fullQuestions.splice(IDindex, 1);
      $scope.changed = true;
    };

    function confirmLeavePage(e) {
      var confirmed;
      if ($scope.changed) {
        confirmed = $window.confirm('You have unsaved changes. Continue?');
        if (e && !confirmed) {
          e.preventDefault();
        }
      }
    }

    //$window.addEventListener('beforeunload', confirmLeavePage);

    $scope.$on('$locationChangeStart', confirmLeavePage);

    $scope.saveExam = function() {
      $http.put('/api/exams/' + $scope.exam._id, $scope.exam).success(function() {
        toastr.success('Exam successfully updated!', {
          timeOut: 1000
        });
      }).error(function(err) {
        toastr.error('Error: ' + err, {
          timeOut: 500
        });
      });
      $scope.changed = false;
    };

    $scope.saveQuestion = function(question) {
      for (var i = 0; i < question.choices.length; i++) {
        if (question.choices[i].tempCorrect === 'true') {
          question.choices[i].correct = true;
        }
        else if (question.choices[i].tempCorrect === 'false') {
          question.choices[i].correct = false;
        }
      }
      console.log('Updating this question:');
      console.log(JSON.stringify(question));
      $http.put('/api/questions/' + question._id, question).success(function(data) {
        console.log('Successfully updated question ' + data._id);
        question.editing = false;
      }).error(function(err) {
        console.log('Error updating question: ' + err);
        question.editing = false;
      });
    };
  });
