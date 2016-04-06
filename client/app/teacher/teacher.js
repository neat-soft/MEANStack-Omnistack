'use strict';

angular.module('fsaApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/teacher/assignment/:assignmentCode', {
        templateUrl: 'app/teacher/assignment/assignment.html',
        controller: 'TeacherAssignmentCtrl'
      })
      .when('/teacher/classroom/:classCode', {
        templateUrl: 'app/teacher/classroom/classroom.html',
        controller: 'TeacherClassroomCtrl'
      })
      .when('/teacher/sampleAssignment', {
        templateUrl: 'app/teacher/sample/sampleAssignment.html',
        controller: 'TeacherSampleAssignmentCtrl'
      })
      .when('/teacher', {
        templateUrl: 'app/teacher/teacher.html',
        controller: 'TeacherCtrl'
      })
      .when('/teacher/gradebook/:classCode/:assignmentId', {
        templateUrl: 'app/teacher/gradebook/gradebook.html',
        controller: 'GradebookCtrl'
      });
  });
