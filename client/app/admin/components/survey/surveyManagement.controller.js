'use strict';

angular.module('fsaApp')
  .controller('SurveyCtrl', function ($scope, socket, Auth, $http, ngDialog, filterFilter) {

    $scope.today = new Date(Date.now());

    $scope.search = '';
    $scope.currentPage = 1;
    $scope.maxPage = 1;
    $scope.lim = 2;

    // Fetch All Surveys
    $http.get('/api/surveys').success(function (surveys) {
      $scope.surveys = surveys;
      $scope.filtered = surveys;
      socket.syncUpdates('survey', $scope.surveys);
      $scope.maxPage = Math.ceil(surveys.length/$scope.lim);
    });


    $scope.searchTypes = [
      {name: 'Any', value: '$'},
      {name: 'E-mail', value:'email'},
      {name: 'Name', value: 'name'},
      {name: 'Approved', value: 'approved'},
      {name: 'Claimed', value: 'numClaimed'}
    ];

    $scope.searchType = $scope.searchTypes[0].value;


    $scope.$watch('filtered', function(filtered) {
      if (filtered) {
        var filterLen = filtered.length;
        if (filterLen > 0) {
          $scope.maxPage = Math.ceil(filterLen/$scope.lim);
        }
        else {
          $scope.maxPage = 1;
        }
      }
    });

    //Changes the page of the users.
    $scope.page = function(step) {
      var newPage = $scope.currentPage + step;
      if ((newPage < 1 ) || (newPage > $scope.maxPage)) {
        return;
      }
      else {
        $scope.currentPage = newPage;
      }
    };

    $scope.updateFiltered = function() {
      var filt = {};
      filt[$scope.searchType] = $scope.search;
      $scope.currentPage = 1;
      $scope.filtered = filterFilter($scope.surveys, filt);
    };

    // Add Survey Modal
    $scope.addSurveyModal = function () {
      ngDialog.open({
        template: 'app/admin/components/survey/addSurvey.html',
        controller: 'AddSurveyCtrl',
        scope: $scope
      });
    };

    $scope.removeSurvey = function(surveyId) {
      $http.delete('/api/surveys/' + surveyId);
    };

    $scope.enableSurvey = function(surveyId) {
      $http.put('/api/surveys/enable/' + surveyId);
      for (var i = 0; i < $scope.surveys.length; i++) {
        if ($scope.surveys[i]._id === surveyId) {
          $scope.surveys[i].active = true;
        }
      }
    };

    $scope.disableSurvey = function(surveyId) {
      $http.put('/api/surveys/disable/' + surveyId);
      for (var i = 0; i < $scope.surveys.length; i++) {
        if ($scope.surveys[i]._id === surveyId) {
          $scope.surveys[i].active = false;
        }
      }
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('survey');
    });

  });
