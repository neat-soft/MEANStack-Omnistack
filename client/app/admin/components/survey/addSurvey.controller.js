'use strict';

angular.module('fsaApp')
  .controller('AddSurveyCtrl', function ($scope, $window, $http, Auth, ngDialog) {
    $scope.currentUser = Auth.getCurrentUser();

    $scope.survey = {
      name: '',
      info: '',
      questions: [{body: '', choices: [{choiceContent: '', choiceTimesPicked: 0}]}]
    };

    $scope.addQuestion = function() {
      $scope.survey.questions.push({questionContent: '', choices: [{choiceContent: ''}]});
    };

    $scope.addChoice = function(question) {
      question.choices.push({choiceContent: ''});
    };

    $scope.removeQuestion = function(questionIndex) {
      $scope.survey.questions.splice(questionIndex, 1);
    };

    $scope.removeChoice = function(question, choiceIndex) {
      question.choices.splice(choiceIndex, 1);
    };

    $scope.addNewSurvey = function (form) {
      var survey = $scope.survey;
      survey.active = true;
      console.log('Submitting form');
      if (form.$valid) {
        Auth.addNewSurvey(survey);
        ngDialog.close();
      }
      else {
        $window.alert(form.$errors);
      }
    };

  });
