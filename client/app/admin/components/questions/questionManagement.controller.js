'use strict';

angular.module('fsaApp')
  .controller('QuestionManageCtrl', function ($scope, socket, $http, ngDialog, toastr, filterFilter) {
    $scope.questionSearch = '';
    $scope.questionCurrentPage = 1;
    $http.get('api/questions/')
      .success(function(questions) {
        $scope.questions = questions;
        $scope.filteredQuestions = questions;
      });
    $scope.maxPage = 1;

    $scope.subjectOptions = [null];
    $scope.questionSubject = $scope.subjectOptions[0];

    $http.get('/api/settings/byName/subjects/')
      .success(function(subjects) {
        console.log(subjects);
        for(var i=0; i < subjects.info.subjects.length; i++) {
          $scope.subjectOptions.push(subjects.info.subjects[i]);
        }
      }).error(function(err) {
        toastr.error(err);
      });

    $scope.questionLim = 2;
    socket.syncUpdates('questions', $scope.questions);
    $scope.questionSearchTypes = [
      {name: 'Any', value: '$'},
      {name: 'Body', value: 'body'},
      {name: 'Explanation', value: 'explanation.body'}
    ];
    $scope.questionSearchType = $scope.questionSearchTypes[0].value;

    $scope.orderTypes = [
      {name: 'None', value: ''},
      {name: 'Name (A-Z)', value: 'name'},
      {name: 'Name (Z-A)', value:'-name'},
      {name: 'Last login Date (Recent First)', value: '-lastLogin'},
      {name: 'Last login Date (Recent Last)', value: 'lastLogin'},
    ];

    $scope.$watch('filteredQuestions', function(filteredQuestions) {
      if (filteredQuestions) {
        var filterLen = filteredQuestions.length;
        if (filterLen > 0) {
          $scope.questionMaxPage = Math.ceil(filterLen/$scope.questionLim);
        }
        else {
          $scope.questionMaxPage = 1;
        }
      }
    });

    $scope.questionTagRestrictions = [
      {
        name: 'None',
        val: function(q) {
          return q.tags.length === 0;
        }
      },
      {
        name: 'Some',
        val: function(q) {
          return q.tags.length > 0;
        }
      },
      {
        name: 'Any',
        val: null
      }
    ];

    $scope.questionTagRestriction = $scope.questionTagRestrictions[2].val;

    $scope.addTag = function(q) {
      if (q.newTag) {
        q.tags.push(q.newTag);
        q.newTag = null;
      } else {
        console.log('Error, no new tag: ' + q.newTag);
      }
    };

    $scope.delTag = function(question, index) {
      question.tags.splice(index, 1);
    };

    $scope.delQuestion = function(q) {
      var reallyDel = ngDialog.open({
        template: 'components/confirmModal/confirmModal.html',
        data: {
          message: 'Deleting questions can lead to weird exam issues!'
        }
      });
      reallyDel.closePromise.then(function(data) {
        if (data.value) {
          $http.delete('api/questions/' + q._id)
            .success(function() {
              toastr.success('Question deleted!');
            }).error(function(err) {
              toastr.error(err);
            });
        }
      });

    };
    $scope.allTags = [];
    $http.get('api/questions/tags')
      .success(function(tags) {
        $scope.allTags = tags;
      }).error(function(err){
        toastr.error(err);
      });

    $scope.saveQuestion = function(newQuestion, qIndex) {
      if(newQuestion.choices) {
        for (var i = 0; i < newQuestion.choices.length; i++) {
          newQuestion.choices[i].correct = newQuestion.choices[i].tempCorrect;
        }
      }
      $http.put('api/questions/' + newQuestion._id, newQuestion)
        .success(function(q) {
          var realIndex = ($scope.questionCurrentPage-1) * $scope.questionLim + qIndex;
          console.log(q);
          $scope.filteredQuestions[realIndex] = q;
          $scope.filteredQuestions[realIndex].editing = false;
        });
    };

    //Changes the page of the questions.
    $scope.questionPage = function(step) {
      var newPage = $scope.questionCurrentPage + step;
      if ((newPage < 1 ) || (newPage > $scope.questionMaxPage)) {
        return;
      }
      else {
        $scope.questionCurrentPage = newPage;
      }
    };

    $scope.setFilteredQuestions = function() {
      $scope.filteredQuestions = $scope.questions;
      if ($scope.filteredQuestions) {
        var filterLen = $scope.filteredQuestions.length;
        if (filterLen > 0) {
          $scope.questionMaxPage = Math.ceil(filterLen/$scope.questionLim);
        }
        else {
          $scope.questionMaxPage = 1;
        }
      }
    };

    $scope.updateFilteredQuestions = function() {
      var filt = {};
      filt[$scope.questionSearchType] = $scope.questionSearch;
      if ($scope.questionSubject) {
        console.log('Updating subject to: ' + $scope.questionSubject);
        filt.subject = $scope.questionSubject;
      } else {
        delete filt.subject;
      }

      if ($scope.questionTagRestriction) {
        var toFilter = filterFilter($scope.questions, $scope.questionTagRestriction);
        $scope.filteredQuestions = filterFilter(toFilter, filt);
      } else {
        $scope.filteredQuestions = filterFilter($scope.questions, filt);
      }

      $scope.questionCurrentPage = 1;
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
    $scope.addSubjectsTaughtModal = function (question) {
      ngDialog.open({
        template: 'app/admin/components/subjectsTaught/subjectsTaught.html',
        controller: 'SubjectsTaughtCtrl',
        scope: $scope,
        data: question
      });
    };

  });
