'use strict';

angular.module('fsaApp')
  .factory('SubjectNames', function () {
    var readableSubjects = {
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

    return {
      getSubjectName: function (sub) {
        return readableSubjects[sub];
      }
    };
  });
