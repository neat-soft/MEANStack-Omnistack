'use strict';

angular.module('fsaApp')
  .controller('SurveyModalCtrl', function ($scope, ngDialog, $http) {
    $scope.submitSurvey = function(form) {
      if (form.$valid) {
        $http.post('/api/surveyResponses', $scope.survey);
        ngDialog.close();
      }
    };
  });
