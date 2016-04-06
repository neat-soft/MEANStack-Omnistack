'use strict';

angular.module('fsaApp')
  .directive('remove-me', function() {
    return function(scope, element) {
      element.bind('click', function() {
        console.log('test');
      });
    };
  })
  .controller('AccountCtrl', function ($scope, $location, User, ngDialog) {
    User.get(function(response) {
      $scope.user = response;
      if (!response.academicRole) {
        var roleModal = ngDialog.open({
          template: 'components/academicRoleModal/academicRoleModal.html',
          controller: 'AcademicRoleModalCtrl',
          className: 'lgModal'
        });
      } else if (response.academicRole == 'Teacher') {
        $location.url('/teacher')
      } else {
        $location.url('/student')
      }
    });
    $scope.user = User.get();

    $scope.removeMe = function($event) {
      $event.target.remove();
    };

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
  });
