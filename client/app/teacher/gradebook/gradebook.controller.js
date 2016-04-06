'use strict';

angular.module('fsaApp').controller('GradebookCtrl', ["$scope", "classroomHelper", "$http", "$routeParams",
  function ($scope, classroomHelper, $http, $routeParams) {
    $scope.students = {};           /* Allows for quick and easy lookup of students */
    $scope.selectedStudent = null;  /* Student the teacher wants to review */
    var loopScope = {};             /* Used to add scope to loops */

    // Create students object for quick access to each student and his/her submissions data
    var populateStudents = function() {
      for(var studentIndex = $scope.classroom.students.length - 1; studentIndex >= 0; studentIndex--) {
        loopScope.student = $scope.classroom.students[studentIndex];
        $scope.students[loopScope.student._id] = {
          name: loopScope.student.name
        };

        delete loopScope.student;
      }

      for(loopScope.assignmentIndex = $scope.classroom.assignments.length - 1; loopScope.assignmentIndex >= 0; loopScope.assignmentIndex--) {
        if($scope.classroom.assignments[loopScope.assignmentIndex].assignmentId === $routeParams.assignmentId) {
          // Found the current selected assignment, populate the rest of the students object
          loopScope.assignment = $scope.classroom.assignments[loopScope.assignmentIndex];
          $scope.currentAssignment = loopScope.assignment;

          for(var submissionIndex = loopScope.assignment.submissions.length - 1; submissionIndex >= 0; submissionIndex--) {
            loopScope.submission = loopScope.assignment.submissions[submissionIndex];
            loopScope.student = $scope.students[loopScope.submission.studentId];

            // If the submission was scored, use the score.  Otherwise, generate it.
            if(loopScope.assignment.submissions[submissionIndex].score) {
              loopScope.student.score = loopScope.submission.score;
            } else {

            }

            loopScope.student.submissionCode = loopScope.submission.code;
            loopScope.student.submissionFullyGraded = loopScope.submission.fullyGraded;
            loopScope.student.submissionId = loopScope.submission._id;
            loopScope.student.submssion = loopScope.submission.submission;
            // loopScope.student.average = student

            delete loopScope.submission;
            delete loopScope.student;
          }

          delete loopScope.assignment;
        }
      }
    };

    // Set up the classroom
    var cachedClassroom = classroomHelper.findTeacherClassroom($routeParams.classCode);
    if(cachedClassroom) {
      // Classroom was cached.
      $scope.classroom = cachedClassroom;

      populateStudents();
    } else {
      // Retrieve the classroom from the server
      $http.get('/api/classrooms/byTeacher/byCode/' + $routeParams.classCode).then(
        function(serverResponse) {
          // Server was successful.  Set the classroom returned from the server.
          classroomHelper.updateTeacherClassrooms(serverResponse.data);
          $scope.classroom = serverResponse.data;

          populateStudents();
        }, function(serverResponse) {
          // Error.  Handle it.
          $scope.serverError = serverResponse.data;
        }
      );
    }

    $scope.setSelectedStudent = function(student) {
      $scope.selectedStudent = student;
    };
  }
]);
