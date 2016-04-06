'use strict';
//var angular = {};
//var $ = {};

angular.module('fsaApp')
  .controller('StudentPracticeCtrl', function ($scope, $http, $window, $routeParams, ngDialog, Auth, $location, $rootScope, $timeout, toastr) {
    $scope.classURL = 'student/classroom/' + $routeParams.classCode;

    $scope.currentUser = Auth.getCurrentUser();
    $scope.examSubmit = false;
    $scope.percentages = 0;
    $scope.numCorrect = 0;
    $scope.numGraded = 0;
    $scope.numUngraded = 0;
    $scope.choices = {};

    var practiceUrl = '/api/questions/practice/' + $routeParams.subject
    if ($routeParams.topic) {
      practiceUrl += ('/' + $routeParams.topic);
    }
    $http.get(practiceUrl)
      .success(function(questions) {
        $scope.totalQuestions = questions.length;
        $scope.questions = questions;
        $scope.activeQuestion = 0;
      }).error(function(err) {
        toastr.error(err);
        $location.path('/');
      });

    $scope.next = function() {
      if ($scope.activeQuestion < ($scope.questions.length - 1)) {
        $scope.activeQuestion++;
      }
    }

    $scope.prev = function() {
      if ($scope.activeQuestion > 0) {
        $scope.activeQuestion--;
      }
    }

    $scope.triggerSignup = function() {
      var signupModal = ngDialog.open({
        template: 'components/signupModal/signupModal.html',
        controller: 'SignupModalCtrl',
        className: 'lgModal',
      });

      signupModal.closePromise.then(function(data) {
        $scope.currentUser = Auth.getCurrentUser();
      });
    };

    //  Submit Exam
    $scope.submitExam = function () {
      $scope.examSubmit = true;
      for (var i = 0; i < $scope.questions.length; i++) {
        if ($scope.hasOneCorrect($scope.questions[i].choices)) {
          //Single correct multiple choice
          var isCorrect = false;
          if ($scope.questions[i].response) {
            isCorrect = $scope.questions[i].response.correct;
            console.log(isCorrect);
          }
          $scope.numGraded++;
          if (isCorrect) {
            $scope.numCorrect++;
            $scope.questions[i].correct = true;
          } else if (isCorrect === false) {
            $scope.questions[i].correct = false;
          }
        } else {
          //Multiple correct multiple choice
          var isCorrect = gradeCheckboxes($scope.questions[i]);
          if (isCorrect) {
            $scope.numCorrect++;
            $scope.questions[i].correct = true;
          }
          if (isCorrect === false) {
            $scope.questions[i].correct = false;
          }
          $scope.numGraded++
        }
      }
    };

    var gradeCheckboxes = function(question) {
      var numCorrect = 0;
      for (var x in question.response) {
        if (question.response[x].correct === true) {
          numCorrect++;
        } else if (question.response[x].correct === false) {
          return false;
        }
      }
      if (numCorrect === 0) {
        // not attempted
        return undefined;
      }
      var numReallyCorrect = 0;
      for (var j = 0; j < question.choices.length; j++) {
        if (question.choices[j].correct) {
          numReallyCorrect++;
        }
      }
      return numReallyCorrect === numCorrect;
    }

    $scope.hasOneCorrect = function (choices) {
      var counter = 0;
      for (var i = 0; i < choices.length; ++i) {
        if (choices[i].correct) {
          ++counter;
        }
      }
      return counter === 1;
    };
  });
