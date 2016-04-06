'use strict';

angular.module('fsaApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/surveyModal', {
        templateUrl: 'components/surveyModal/surveyModal.html',
        controller: 'SurveyModalCtrl'
      });
  });
