'use strict';

angular.module('fsaApp')
  .controller('AdminExamCtrl', function ($scope, $http, socket, ngDialog, $window, $route, $location) {
    // Fetch All Exams
    $scope.exams = [];
    $scope.examObj = {};
    $scope.readableSubjects = {
      APCalcAB: 'AP Calculus AB',
      APCalcBC: 'AP Calculus BC',
      APStats: 'AP Statistics',
      APPhysics1: 'AP Physics 1',
      APPhysics2: 'AP Physics 2',
      APEurHistory: 'AP European History',
      APUSHistory: 'AP US History',
      APWorldHistory: 'AP World History',
      APMicroecon: 'AP Microeconomics',
      APMacroecon: 'AP Macroeconomics',
      APPsych: 'AP Psychology',
      APBio: 'AP Biology',
      APChem: 'AP Chemistry',
      APEnvSci: 'AP Env. Science',
      APUSGovt: 'AP US Gov. & Pol.',
      APHumGeo: 'AP Human Geography'
    };

    $scope.correctOpts = [
      {
        val: true,
        name: 'Correct'
      },
      {
        val: false,
        name: 'Incorrect'
      }
    ];

    $scope.$watch('exams', function() {
      var exams = $scope.exams;
      for (var i = 0; i < exams.length; i++) {
        if ($scope.examObj[exams[i].subject]) {
          $scope.examObj[exams[i].subject].push(exams[i]);
        }
        else {
          $scope.examObj[exams[i].subject] = [exams[i]];
        }
      }
    });

    $http.get('/api/exams').success(function (exams) {
      $scope.exams = exams;
    });

  });
