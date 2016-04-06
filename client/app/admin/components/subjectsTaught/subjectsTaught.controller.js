'use strict';

angular.module('fsaApp')
  .controller('SubjectsTaughtCtrl', function ($scope, ngDialog, $http) {
    var teacher = $scope.ngDialogData;
    $scope.subjectsTaught = [];
    $scope.subjects = [
      {ticked: false, subjectName: 'APCalcAB', name: 'AP Calculus AB'},
      {ticked: false, subjectName: 'APCalcBC', name: 'AP Calculus BC'},
      {ticked: false, subjectName: 'APStats', name: 'AP Statistics'},
      {ticked: false, subjectName: 'APPhysics1', name: 'AP Physics 1'},
      {ticked: false, subjectName: 'APPhysics2', name: 'AP Physics 2'},
      {ticked: false, subjectName: 'APEurHistory', name: 'AP European History'},
      {ticked: false, subjectName: 'APUSHistory', name: 'AP US History'},
      {ticked: false, subjectName: 'APWorldHistory', name: 'AP World History'},
      {ticked: false, subjectName: 'APMicroecon', name: 'AP Microeconomics'},
      {ticked: false, subjectName: 'APMacroecon', name: 'AP Macroeconomics'},
      {ticked: false, subjectName: 'APPsych', name: 'AP Psychology'},
      {ticked: false, subjectName: 'APBio', name: 'AP Biology'},
      {ticked: false, subjectName: 'APChem', name: 'AP Chemistry'},
      {ticked: false, subjectName: 'APEnvSci', name: 'AP Env. Science'},
      {ticked: false, subjectName: 'APUSGovt', name: 'AP US Gov. & Pol.'},
      {ticked: false, subjectName: 'APHumGeo', name: 'AP Human Geography'}
    ];

    for (var i = 0; i < teacher.subjectsTaught.length; ++i) {
      for (var j = 0; j < $scope.subjects.length; ++j) {
        if (teacher.subjectsTaught[i].subjectName === $scope.subjects[j].subjectName) {
          $scope.subjects[j].ticked = true;
        }
      }
    }

    //Save Subjects Taught to DB
    $scope.saveSubjectsTaught = function () {
      var finalSubjectsTaught = [];
      for (var i = 0; i < $scope.subjectsTaught.length; ++i) {
        finalSubjectsTaught.push({subjectName: $scope.subjectsTaught[i].subjectName});
      }
      $http.put('/api/users/' + teacher._id + '/savesubjectstaught', {subjectsTaught: JSON.stringify(finalSubjectsTaught)}).then(function (res) {
        if (res.status === 200) {
          //Update local user Object
          $scope.ngDialogData.subjectsTaught = finalSubjectsTaught;
        }
      });
      ngDialog.closeAll(true);
    }
  });
