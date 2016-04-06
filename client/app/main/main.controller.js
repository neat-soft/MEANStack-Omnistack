'use strict';

angular.module('fsaApp')
  .controller('MainCtrl', function ($scope, toastr, persist, $location, $http, Auth) {
    Auth.isLoggedInAsync( function (LoggedIn) {
      if (LoggedIn) {
        if (Auth.isTeacher()) {
          $location.path('/teacher');
        } else if (Auth.isStudent()) {
          $location.path('/student');
        }
      }
    })
    $scope.role = {};
    $scope.subjects = [
      {
        dbName: 'APCalcAB',
        fullName:  'AP Calculus AB'
      },
      {
        dbName: 'APCalcBC',
        fullName:  'AP Calculus BC'
      },
      {
        dbName: 'APStats',
        fullName:  'AP Statistics'
      },
      {
        dbName: 'APPhysics1',
        fullName:  'AP Physics 1'
      },
      {
        dbName: 'APPhysics2',
        fullName:  'AP Physics 2'
      },
      {
        dbName: 'APEurHistory',
        fullName:  'AP European History'
      },
      {
        dbName: 'APWorldHistory',
        fullName:  'AP World History'
      },
      {
        dbName: 'APPsych',
        fullName:  'AP Psychology'
      },
      {
        dbName: 'APBio',
        fullName:  'AP Biology'
      },
      {
        dbName: 'APChem',
        fullName:  'AP Chemistry'
      },
      {
        dbName: 'APEnvSci',
        fullName:  'AP Environmental Science'
      },
      {
       dbName: 'APUSGovt',
        fullName:  'AP US Government'
      },
      {
        dbName: 'APHumGeo',
        fullName:  'AP Human Geography'
      }
    ];

    var subjectObj = {};
    for (var i = 0; i < $scope.subjects.length; i++) {
      subjectObj[$scope.subjects[i].fullName] = $scope.subjects[i].dbName
    }

    $scope.newAssignment = {
      studentSubject: '',
      teacherSubject: '',
      topic: ''
    }

    $scope.addAssignment = function(assignment) {
      $location.path('/login');
      return;
      /***** Following code causing bugs

      assignment.subject = assignment[$scope.role.name + 'Subject'];
      if (typeof assignment.subject === 'string') {
        assignment.subject = {
          dbName: subjectObj[assignment.subject],
          fullName: assignment.subject
        };
      }
      if ($scope.role.name === 'student') {
        // Student trying to take an assignment.
        var practiceUrl = '/student/practice/' + assignment.subject.dbName;
        if (assignment.topic) {
          practiceUrl += '/' + assignment.topic;
        }
        $location.path(practiceUrl)
      } else {
        // Teacher trying to make an assignment.
        assignment.origin = 'homepage';
        assignment.name = 'Assignment';
        assignment.questionNumber = 10;
        persist.newAssignment = assignment;
        $location.path('/teacher/assignment/Assignment');

      }
      
      *****/
    };

    // input the subject object and returns tags specific to that subject
    $scope.updateTags = function(subject) {
      // limit calls to only when user selects a valid subject.
      if (subjectObj[subject]) {
        $http.get('api/questions/tags/' + subjectObj[subject])
          .success(function(tags) {
            $scope.topics = tags;
          }).error(function(err){
            toastr.error(err, {
              timeOut: 1000
            });
          });
      }
    };

  });
