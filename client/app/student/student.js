'use strict';

angular.module('fsaApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/student/classroom/:classCode/assignment/:assignmentCode', {
        templateUrl: 'app/student/classroom/assignment/assignment.html',
        controller: 'StudentClassroomAssignmentCtrl'
      })
      .when('/student/practice/:subject/:topic?',{
        templateUrl: 'app/student/practice/practice.html',
        controller: 'StudentPracticeCtrl'
      })
      .when('/student/classroom/:classCode', {
        templateUrl: 'app/student/classroom/classroom.html',
        controller: 'StudentClassroomCtrl'
      })
      .when('/student', {
        templateUrl: 'app/student/student.html',
        controller: 'StudentCtrl'
      });
  });
