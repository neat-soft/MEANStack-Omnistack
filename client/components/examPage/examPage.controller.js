'use strict';

angular.module('fsaApp')
  .controller('ExamPageCtrl', function ($scope, $http, $window, $routeParams, ngDialog, Auth, $location, $rootScope, $timeout, toastr, socket) {
    $scope.showNotifications = true;
    function confirmLeavePage(e) {
      var confirmed;
      if (!$scope.preExam && !$scope.examSubmit) {
        confirmed = $window.confirm('Throw away your progress?');
        if (e && !confirmed) {
          e.preventDefault();
        } else {
          $scope.showNotifications = true;
          removeNotifications();
        }
      } else {
        removeNotifications();
      }
    }

    //Remove Notifications
    var removeNotifications = function () {
      $http.get('api/exams/notifications/remove');
    };

    var hideNotifications = function () {
      $scope.showNotifications = false;
    };

    $scope.notifications = [];
    socket.syncUpdates('exam', $scope.notifications, function (action, doc) {
      if (doc.notification.for === 'exam' && $scope.showNotifications && doc.to === $scope.currentUser._id) {
        wellWishers++;
        var msg = '<div class="toastmsg  avenir-light">' + doc.user.name + ' wishes you good luck on your exam!' + '</div>';
        var t = toastr.info('<div class="toastmsg top-margin-msg avenir-light"><small class="text-smaller pull-right">Tap to mute notifications</small></div>', msg, {
          allowHtml: true,
          autoDismiss: true,
          onShown: function () {
            $timeout(function () {
              toastr.clear(t);
            }, 5000);
          },
          closeButton: true,
          iconClass: 'custom-smiley',
          onHidden: function (tapped) {
            if (tapped) {
              hideNotifications();
            }
          }
        });
      }
    });

    $scope.getDate = function (dateStr) {
      var dateObj = new Date(dateStr);
      return dateObj.toLocaleDateString();
    };

    $scope.getTime = function (dateStr) {
      var dateObj = new Date(dateStr);
      return dateObj.toLocaleTimeString();
    };

    //$window.addEventListener('beforeunload', function () {
    //  removeNotifications();
    //});

    $scope.$on('$locationChangeStart', confirmLeavePage);

    $scope.quizSet = [];
    $scope.currentUser = Auth.getCurrentUser();
    $scope.subject = $routeParams.subjectname;
    $scope.examPart = [];
    $scope.exam = [];
    $scope.examNumber = parseInt($routeParams.examnumber);
    $scope.sectionNumber = parseInt($routeParams.section);
    $scope.partNumber = 1;
    $scope.preExam = true;
    $scope.choices = {};
    $scope.examSubmit = false;
    $scope.timer = '00:00';
    $scope.timeInMinutes = 0;
    $scope.userChoices = {};
    $scope.totalQuestions = 0;
    $scope.attemptedQuestions = 0;
    $scope.percentages = 0;
    $scope.fourChoices = false;
    $scope.examAuthorized = false;
    $scope.availableParts = 0;
    $rootScope.showChatBox = false;
    $scope.examSet = {};
    $scope.instructions = false;
    $scope.preQuestions = 0;
    $scope.answeredQuestions = [];
    $scope.timeSpent = 0;
    $scope.numberOfWrongAnswers = 0;
    $scope.isCollapsed = {};

    //local vars
    var userEmail = $scope.currentUser.email;
    var userName = $scope.currentUser.name;
    var userSubjects = $scope.currentUser.subjects;
    var isAdmin = Auth.isAdmin();
    var wellWishers = 0;


    Auth.isLoggedInAsync(function (loggedIn) {
      if (loggedIn) {
        userEmail = $scope.currentUser.email;
        userName = $scope.currentUser.name;
        userSubjects = $scope.currentUser.subjects;
        isAdmin = Auth.isAdmin();
        //TODO for expiration
        //for (var i = 0; i < userSubjects.length; ++i) {
        //  if (userSubjects[i]['subjectName'] == $scope.subject && userSubjects[i]['expires'] >= new Date()) {
        //Get Exam Questions
        $http.get('/api/exams/' + $scope.subject + '/' + $scope.examNumber + '/' + $scope.sectionNumber)
          .success(function (result) {
            $scope.examSet = result;
            if (typeof result['section' + $scope.sectionNumber]['part' + $scope.partNumber] === 'undefined') {
              $location.path('/account');
              return false;
            }
            for (var l in result['section' + $scope.sectionNumber]) {
              if (result['section' + $scope.sectionNumber]['part' + ($scope.availableParts + 1)].fullQuestions.length > 0) {
                ++$scope.availableParts;
                $scope.totalQuestions += result['section' + $scope.sectionNumber]['part' + $scope.availableParts].fullQuestions.length;
              }
            }
            $scope.instructions = ($scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].instructions);
          }).error(function (data, status, headers, config) {
            //alert('You dont have access to this exam');
            $location.path('/account');
          });
        //TODO for expiration
        //  } else {
        //    alert('You don\'t have access for this exam');
        //    $location.path('/account');
        //  }
        //}
      } else {
        $location.path('/login');
      }

    });

    //Start Exam
    $scope.startExam = function () {
      $scope.preExam = false;
      $scope.prepareExam();
    };

    //prepare exam
    $scope.prepareExam = function () {
      $scope.fourChoices = $scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].fourChoices;
      //Reduce choices array to length 4
      if ($scope.fourChoices) {
        for (var i = 0; i < $scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].fullQuestions.length; ++i) {
          var choices = $scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].fullQuestions[i].choices;
          var index = 1;
          while (choices.length > 4 && index <= choices.length) {
            if (!choices[choices.length - index].correct) {
              $scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].fullQuestions[i].choices.splice(0 - index, 1);
              choices = $scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].fullQuestions[i].choices;
            }
            ++index;
          }
          /*Commented for branch remove-options-randomization*/
          //Shuffle Choices
          //$scope.shuffle($scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].fullQuestions[i].choices);
        }
      }
      /*Commented for branch remove-options-randomization*/
      //else {
      //for (var j = 0; j < $scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].fullQuestions.length; ++j) {
      //  //Shuffle Choices
      //  $scope.shuffle($scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].fullQuestions[j].choices);
      //}
      //}

      //Shuffle Questions
      $scope.shuffle($scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].fullQuestions);
      //separate multiple correct answers type questions
      var temp = []; //temp array for multiple correct answers
      for (var k = 0, m = ($scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].fullQuestions); k < m.length; ++k) {
        var correctCount = 0;
        for (var l = 0, q = m[k].choices; l < q.length; ++l) {
          if (m[k].choices[l].correct) {
            ++correctCount;
          }
        }
        if (correctCount > 1) {
          //push to multiple correct answers array(temp array)
          temp.push(($scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].fullQuestions).splice(k, 1)[0]);
        }
      }
      if (temp.length > 0) {
        //Merge temp array into questions
        ($scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].fullQuestions) = ($scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].fullQuestions).concat(temp);
      }
      $scope.examPart = $scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber];
      $scope.exam = $scope.examSet;
      $scope.examAuthorized = true;
      $scope.timeInMinutes = parseInt($scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].timeInMinutes) * 60;

      //Listen for timer stopped
      $scope.$on('timer-stopped', function (event, args) {
        $scope.timeSpent = ($scope.timeInMinutes * 1000) - args.millis;
      });
    };

    //  Submit Exam
    $scope.submitExam = function () {
      // Check for survey
      $http.get('/api/surveys/forUser/' + $scope.currentUser._id)
        .success(function (data) {
          $scope.survey = data;
          ngDialog.open({
            template: 'components/surveyModal/surveyModal.html',
            controller: 'SurveyModalCtrl',
            className: 'surveyModal',
            scope: $scope
          });
        })
        .error(function (error) {
          console.log(error);
        });
      if ($scope.availableParts === $scope.partNumber) {
        if ($scope.availableParts > 1) {
          var tempExamPart = [];
          $scope.examPart = {};
          $scope.examPart.fullQuestions = [];
          var count = 0;
          for (var i in $scope.examSet['section' + $scope.sectionNumber]) {
            ++count;
            tempExamPart.push($scope.examSet['section' + $scope.sectionNumber]['part' + count].fullQuestions);
          }
          for (var j = 0; j < tempExamPart.length; ++j) {
            for (var k = 0; k < tempExamPart[j].length; ++k) {
              $scope.examPart.fullQuestions.push(tempExamPart[j][k]);
            }
          }
          $scope.preQuestions = 0;
        }
        var choices = $scope.choices;
        $scope.examSubmit = true;
        document.getElementById('countdownTimer').stop();
        //Cloning choices in userChoices to prevent watch
        $scope.userChoices = $scope.clone(choices);
        var answered = [];
        for (var l in $scope.userChoices) {
          if (typeof $scope.userChoices[l]._id === 'undefined') {
            //  has multiple answers
            var counter = 0;
            var correctCounter = 0;
            for (var m in $scope.userChoices[l]) {
              if (typeof $scope.userChoices[l][m].correct !== 'undefined') {
                ++counter;
                if ($scope.userChoices[l][m].correct) {
                  ++correctCounter;
                }
              }
            }
            if (counter == correctCounter) {
              $scope.userChoices[l].correct = true;
              answered.push($scope.userChoices[l]._id);
              ++$scope.attemptedQuestions;
            } else {
              $scope.userChoices[l].correct = false;
              ++$scope.numberOfWrongAnswers;
            }
          } else {
            answered.push($scope.userChoices[l]._id);
            if ($scope.userChoices[l].correct) {
              ++$scope.attemptedQuestions;
            } else {
              ++$scope.numberOfWrongAnswers;
            }
          }
        }

        $timeout(function () {
          angular.element('input[type="radio"],input[type="checkbox"]').prop('disabled', true);
          var questions = $scope.examPart['fullQuestions'];
          for (var i = 0; i < questions.length; ++i) {
            for (var j = 0; j < questions[i]['choices'].length; ++j) {
              //Highlight Correct option
              if (questions[i]['choices'][j]['correct']) {
                $('label[for=' + questions[i]['_id'] + j + ']').closest('li').addClass('green');
              }
            }
          }
        });

        var progress = ($scope.attemptedQuestions * 100 ) / $scope.totalQuestions;
        $scope.percentages = progress.toFixed(1);
        var questionIds = Object.keys($scope.choices);
        var allResponses = [];
        var allQuestionResponses = {};
        for (var i = 0; i < questionIds.length; ++i) {
          if (typeof $scope.choices[questionIds[i]]._id === 'undefined') {
            var choiceId = [];
            for (var j in $scope.choices[questionIds[i]]) {
              if (typeof $scope.choices[questionIds[i]][j]._id !== 'undefined' && $scope.choices[questionIds[i]][j]._id !== null) {
                choiceId.push($scope.choices[questionIds[i]][j]._id);
              }
            }
            allQuestionResponses[questionIds[i]] = [choiceId];
          } else {
            choiceId = $scope.choices[questionIds[i]]._id;
            allQuestionResponses[questionIds[i]] = [$scope.choices[questionIds[i]]._id];
          }
          allResponses.push({questionId: questionIds[i], choiceId: choiceId});
        }

        $scope.examResponse = {
          examResponses: {
            examId: $scope.exam._id,
            score: progress,
            timeSpent: $scope.timeSpent,
            responses: allResponses
          },
          questionResponses: allQuestionResponses
        };
        /*save stats
         1) number of times user has taken each exam
         2) score from each attempt
         3) userAnalytics
         */
        $http.post('/api/users/exams/stats/', {email: userEmail, examId: $scope.exam._id, score: progress, userAnalytics: $scope.examResponse, wellWishers: wellWishers, exam: {subject: $scope.subject}});
        $rootScope.showChatBox = true;
      } else {
        $scope.nextExam();
      }
    };

    //  Time Over
    $scope.timeOver = function () {
      $scope.submitExam();
    };

    //Proceed to Next Part
    $scope.nextExam = function () {
      $scope.preQuestions += $scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].fullQuestions.length;
      ++$scope.partNumber;
      $scope.instructions = ($scope.examSet['section' + $scope.sectionNumber]['part' + $scope.partNumber].instructions);
      $scope.preExam = true;
    };

    //@ http://jsfromhell.com/array/shuffle [v1.0]
    $scope.shuffle = function (o) {
      for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    };

    $scope.showSubmit = function () {
      return $scope.availableParts == $scope.partNumber && !$scope.preExam && !$scope.examSubmit;
    };

    $scope.showContinue = function () {
      return $scope.availableParts > $scope.partNumber && !$scope.preExam && !$scope.examSubmit;
    };

    //http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
    $scope.clone = function (obj) {
      var copy;

      // Handle the 3 simple types, and null or undefined
      if (null == obj || "object" != typeof obj) return obj;

      // Handle Date
      if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
      }

      // Handle Array
      if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
          copy[i] = $scope.clone(obj[i]);
        }
        return copy;
      }

      // Handle Object
      if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = $scope.clone(obj[attr]);
        }
        return copy;
      }

      throw new Error("Unable to copy obj! Its type isn't supported.");
    };

    $scope.hasOneCorrect = function (choices) {
      var counter = 0;
      for (var i = 0; i < choices.length; ++i) {
        if (choices[i].correct) {
          ++counter;
        }
      }
      return counter == 1;
    };

    $scope.storeQuestionContext = function (question, $event) {
      var el = event.target.name;
      //If has multiple choices
      if (typeof $scope.choices[question._id]._id === 'undefined') {
        //loop through all choices and check if object has _id; if not found delete choice
        for (var j in $scope.choices[question._id]) {
          if (!$scope.choices[question._id][j].hasOwnProperty('_id')) {
            delete $scope.choices[question._id][j];
          }
        }
        //If no choices left, delete question id
        if (Object.size($scope.choices[question._id]) === 0) {
          delete $scope.choices[question._id];
        }
      }

      if ($('[name="' + el + '"]:checked').length > 0) {
        if ($scope.answeredQuestions.indexOf(question._id) < 0) {
          $scope.answeredQuestions.push(question._id);
        }
      } else {
        if ($scope.answeredQuestions.indexOf(question._id) > -1) {
          $scope.answeredQuestions.splice($scope.answeredQuestions.indexOf(question._id), 1);
        }
      }
    };

    //http://stackoverflow.com/a/6700/1548301
    Object.size = function (obj) {
      var size = 0, key;
      for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
      }
      return size;
    };

    $scope.addingComment = {};
    $scope.commentForm = {};
    $scope.commentLim = 3;
    $scope.commentCurrentPage = {};

    $scope.prevPage = function (id) {
      var current = $scope.commentCurrentPage[id];
      if (current > 1) {
        $scope.commentCurrentPage[id] = current - 1
      }
    };

    $scope.nextPage = function (comments, id) {
      var current = $scope.commentCurrentPage[id];
      if (current < $scope.getMaxPages(comments)) {
        $scope.commentCurrentPage[id] = current + 1
      }
    };

    $scope.getMaxPages = function (comments) {
      var l = 1;
      if (comments) {
        l = comments.length;
      }
      if (l === 0) {
        l = 1
      }
      return Math.ceil(l / $scope.commentLim);
    };

    $scope.submitComment = function (comment, question) {
      comment.userId = $scope.currentUser._id;
      comment.user = $scope.currentUser.name;
      comment.date = Date.now();
      $http.post('/api/questions/comment/' + question._id, {comment: comment})
        .success(function (comment) {
          question.comments.push(comment);
          $scope.addingComment[question._id] = false;
          $scope.commentForm[question._id] = {};
        })
        .error(function (err) {
          toastr.error(err);
        });
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('exam');
    });

  }).filter('trustedHtml', ['$sce', function ($sce) {
    return function (value) {
      return $sce.trustAsHtml(value);
    };
  }]);
