'use strict';

angular.module('fsaApp')
  .directive('studentsProgress', function (Auth, $location, $http, User, filterFilter, usSpinnerService) {
    return {
      templateUrl: 'components/studentsProgress/studentsProgress.html',
      restrict: 'EA',
      link: function (scope) {
        scope.currentPage = 1;
        scope.maxPage = 1;
        scope.lim = 10;
        scope.students = [];
        scope.selectedSubject = {};
        scope.filter = {};
        scope.examDetails = [];


        //Prevent Route from Unauthorized user
        if (!Auth.isAdmin() && !Auth.isTeacher()) {
          $location.path('/');
        }

        //Get Current User
        scope.currentUser = Auth.getCurrentUser();

        //Get subjectsTaught from User Object
        if (Auth.isTeacher()) {
          scope.subjectsTaught = scope.currentUser.subjectsTaught;
          scope.students = scope.currentUser.referral.usersReferred;
        }

        //Fetch Students
        scope.getStudents = function () {
          scope.startSpin('spinner-search');
          var queryString = '/api/users/students/list/' + scope.selectedSubject.subject + '/' + scope.currentPage + '/' + scope.lim;
          if (scope.filter.search !== '' && typeof (scope.filter.search) !== 'undefined') {
            queryString = '/api/users/students/list/' + scope.selectedSubject.subject + '/' + scope.currentPage + '/' + scope.lim + '/' + scope.filter.search;
          }
          $http.get(queryString).success(function (students) {
            scope.students = students.users;
            scope.filtered = students.users;
            scope.totalStudents = students.count;
            scope.examDetails = students.examDetails;
            //socket.syncUpdates('betaKey', scope.betaKeys);
            scope.maxPage = Math.ceil(scope.totalStudents / scope.lim);
            scope.stopSpin('spinner-search');
          });
        };

        //If Admin: Allow all subjects
        if (Auth.isAdmin()) {
          scope.subjectsTaught = [
            {subjectName: 'APCalcAB'},
            {subjectName: 'APCalcBC'},
            {subjectName: 'APStats'},
            {subjectName: 'APPhysics1'},
            {subjectName: 'APPhysics2'},
            {subjectName: 'APEurHistory'},
            {subjectName: 'APUSHistory'},
            {subjectName: 'APWorldHistory'},
            {subjectName: 'APMicroecon'},
            {subjectName: 'APMacroecon'},
            {subjectName: 'APPsych'},
            {subjectName: 'APBio'},
            {subjectName: 'APChem'},
            {subjectName: 'APEnvSci'},
            {subjectName: 'APUSGovt'},
            {subjectName: 'APHumGeo'}
          ];
        }

        //Set Initial subject
        if (scope.subjectsTaught.length > 0) {
          scope.selectedSubject.subject = scope.subjectsTaught[0].subjectName;
        }

        //Check if teacher has subjectsTaught
        scope.hasSubjectTaught = function () {
          return scope.subjectsTaught.length > 0;
        };

        scope.$watch('filtered', function (filtered) {
          if (filtered) {
            var filterLen = filtered.length;
            if (filterLen > 0) {
              scope.maxPage = Math.ceil(scope.totalStudents / scope.lim);
            }
            else {
              scope.maxPage = 1;
            }
          }
        });

        //Changes the page of the users.
        scope.page = function (step) {
          var newPage = scope.currentPage + step;
          if ((newPage < 1 ) || (newPage > scope.maxPage)) {
            return;
          }
          else {
            scope.currentPage = newPage;
            scope.getStudents();
          }
        };

        //Update Filter
        scope.updateFiltered = function () {
          scope.currentPage = 1;
          scope.getStudents();
        };

        //Get Exam Attempts
        scope.getExamAttempts = function (student) {
          for (var i = 0; i < student.exams.length; ++i) {
            for (var j = 0; j < scope.examDetails.length; ++j) {
              if (student.exams[i].examId === scope.examDetails[j]._id && scope.examDetails[j].subject === scope.selectedSubject.subject) {
                return student.exams[i].attempts;
              }
            }
          }
          return 0;
        };

        //Get Exam High Score
        scope.getHighScore = function (student) {
          for (var i = 0; i < student.exams.length; ++i) {
            for (var j = 0; j < scope.examDetails.length; ++j) {
              if (student.exams[i].examId === scope.examDetails[j]._id && scope.examDetails[j].subject === scope.selectedSubject.subject) {
                return student.exams[i].score;
              }
            }
          }
          return 0;
        };

        //Update Students List
        scope.updateStudentsList = function () {
          scope.currentPage = 1;
          scope.getStudents();
        };

        scope.startSpin = function (spinner) {
          usSpinnerService.spin(spinner);
        };
        scope.stopSpin = function (spinner) {
          usSpinnerService.stop(spinner);
        };

        scope.getStudents();
      }
    };
  });