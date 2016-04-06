'use strict';
//var angular = {};
//var $ = {};

angular.module('fsaApp')
  .controller('StudentClassroomAssignmentCtrl', function ($scope, $http, $window, $routeParams, ngDialog, Auth, $location, $rootScope, $timeout, toastr, classroomHelper) {
    $scope.classURL = 'student/classroom/' + $routeParams.classCode;

    function confirmLeavePage(e) {
      var confirmed;
      if (!$scope.preExam && !$scope.examSubmit) {
        confirmed = $window.confirm('Throw away your progress?');
        if (e && !confirmed) {
          e.preventDefault();
        }
      }
    }

    $scope.getDate = function (dateStr) {
      var dateObj = new Date(dateStr);
      return dateObj.toLocaleDateString();
    };

    $scope.getTime = function (dateStr) {
      var dateObj = new Date(dateStr);
      return dateObj.toLocaleTimeString();
    };

    $scope.$on('$locationChangeStart', confirmLeavePage);

    $scope.currentUser = Auth.getCurrentUser();
    $scope.preExam = true;
    $scope.examSubmit = false;
    $scope.percentages = 0;
    $scope.numCorrect = 0;
    $scope.numGraded = 0;
    $scope.newUser = {
      name: '',
      period: ''
    };
    $scope.numUngraded = 0;

    // initialization function that changes some initial variables depending on whether a student has already taken the assignment or not
    var init = function (reviewingAssignment, assignment) {
      // initialize variables to account for whether this assignment has been taken or not
      if (reviewingAssignment) {
        $scope.preExam = false;
        $scope.examSubmit = true;
        // assign submissions to rendered questions
        // array of objects that represent student answers to the questions in this assignment
        var submittedAnswers = assignment.submission.submission;
        // loop through student submission and match each submission with corresponding question
        for (var answerIndex = 0; answerIndex < submittedAnswers.length; answerIndex++) {
          var studentResponse = submittedAnswers[answerIndex].response;
          var responseQuestionId = submittedAnswers[answerIndex].questionId;
          for (var questionIndex = 0; questionIndex < $scope.questions.length; questionIndex++) {
            if (responseQuestionId === $scope.questions[questionIndex]._id) { // found the question to match the response
              if (studentResponse) {
                $scope.questions[questionIndex].correct = studentResponse.correct;
                $scope.questions[questionIndex].studentResponse = studentResponse;
              }
              break;
            }
          }
        }
      } else {

        return;
      }
    };

    var submission = [];
    var assignmentId;
    // get assignment from server -- different from assignment stored in classroomHelper
    $http.get('/api/assignments/byClassAndCode/' + $routeParams.classCode +'/' + $routeParams.assignmentCode)
      .success(function(assignment) {
        if (!assignment) { $location.path('/student'); }
        // key elements populated from server to client, including questions
        $scope.totalQuestions = assignment.questions.length;
        $scope.instructions = assignment.instructions;
        $scope.questions = assignment.questions;
        console.log($scope.questions);
        $scope.assignment = assignment;
        assignmentId = assignment._id;
        var matchedAssignment = classroomHelper.findMatchingAssignment($routeParams.classCode, assignment._id);
        if (matchedAssignment.submission) {
          // initialize conditions for student reviewing the assignment
          init(true, matchedAssignment);
        } else if (!matchedAssignment) {
          $http.get('/api/classrooms/byStudent/byCode/' + $routeParams.classCode)
            .success(function(classroom) {
              classroomHelper.addNewClass(classroom);
              matchedAssignment = classroomHelper.findMatchingAssignment($routeParams.classCode, assignment._id);
              // matching assignment found and student has taken it
              if (matchedAssignment.submission) {
                init(true, matchedAssignment);
              // matching assignment found but student has not taken it yet
              } else if (matchedAssignment && !matchedAssignment.submission) {
                init(false, false);
              } else {
                console.log('matching assignment not found');
              }
            }).error(function(err) {
              toastr.error(err);
            });
        } else {
          init(false, false);
        }
      }).error(function(err) {
        toastr.error(err);
        $location.path('/student/classroom/' + $routeParams.classCode);
      });

    //Start Exam
    $scope.startExam = function () {
      if (!$scope.currentUser._id && !$scope.newUser.name) {
        toastr.error('Please enter your name.', {
          timeOut: 1000
        });
      } else {
        $scope.preExam = false;
      }
    };

    $scope.triggerSignup = function() {
      var signupModal = ngDialog.open({
        template: 'components/signupModal/signupModal.html',
        controller: 'SignupModalCtrl',
        className: 'lgModal',
        data: {
          name: $scope.newUser.name,
          period: $scope.newUser.period,
          message: 'Please sign up to see explanations!'
        }
      });

      signupModal.closePromise.then(function(data) {
        $scope.currentUser = Auth.getCurrentUser();
        $http.post('/api/classrooms/student/' + $routeParams.classCode + '/' + $routeParams.assignmentCode, submission)
          .success(function() {
            $scope.percentages = 100*$scope.numCorrect/$scope.numGraded;
          }).error(function(e) {
            toastr.error(e, {timeOut: 1000});
          });
      });
    };

    //  Submit Exam
    $scope.submitExam = function () {
      var choices = $scope.choices;
      $scope.examSubmit = true;
      //Cloning choices in userChoices to prevent watch
      $scope.userChoices = choices;
      for (var i = 0; i < $scope.questions.length; i++) {
        if ($scope.questions[i].type === 'mult') {
          if ($scope.hasOneCorrect($scope.questions[i].choices)) {
            //Single correct multiple choice
            var isCorrect = false;
            if ($scope.questions[i].response) {
              isCorrect = $scope.questions[i].response.correct;
            }
            submission.push({
              response: $scope.questions[i].response,
              questionId: $scope.questions[i]._id,
              correct: isCorrect
            });
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
            submission.push({
              response: $scope.questions[i].response,
              questionId: $scope.questions[i]._id,
              correct: isCorrect
            });
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
        else {
          submission.push({
            response: $scope.questions[i].response,
            questionId: $scope.questions[i]._id,
            correct: undefined
          });
          if ($scope.questions[i].response) {
            $scope.questions[i].attempted = true;
          }
          $scope.numUngraded++;
        }
      }
      if (!$scope.currentUser._id) {
        $scope.triggerSignup();
      } else {
        // Post results of exam to DB
        console.log(submission);
        $http.post('/api/classrooms/student/' + $routeParams.classCode + '/' + $routeParams.assignmentCode, submission)
          .success(function() {
            $http.get('/api/classrooms/byStudent/byCode/' + $routeParams.classCode)
              .success(function(classroom) {
                // update locally stored classroom
                classroomHelper.updateClassroom(classroom);
              }).error(function(err) {
                toastr.error(err);
              });
            toastr.success('Assignment submitted!', {
              timeOut: 1000
            });
            $scope.percentages = 100*$scope.numCorrect/$scope.numGraded;
          }).error(function(e) {
            toastr.error(e, { timeOut: 1000 });
          });
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
