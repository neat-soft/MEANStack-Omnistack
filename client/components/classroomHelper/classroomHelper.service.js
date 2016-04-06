'use strict';

angular.module('fsaApp')
  .factory('classroomHelper', function () {
    // Service logic
    // ...
    // this variable cleverly nicknamed TA because it helps students get set up. This is returned by the service
    var TA = {};
    var studentsClassrooms = [];
    var teacherAssignments = [];
    var teacherClassrooms = [];
    var newAssignment;

    var containsClass = function (classCode) {
      for (var classIndex = 0; classIndex < studentsClassrooms.length; classIndex++) {
        if (studentsClassrooms[classIndex].code === classCode) {
          return true
        }
      }
      return false
    };

    // Public API here 
    // Student functions
    TA.setClasses = function (classes) {
      var aClassroom;
      studentsClassrooms = [];
      for (var classIndex = 0; classIndex < classes.length; classIndex++) {
        aClassroom = {};
        aClassroom.subject = classes[classIndex].subject;
        aClassroom.code = classes[classIndex].code;
        aClassroom.name = classes[classIndex].name;
        aClassroom.assignments = classes[classIndex].assignments;
        aClassroom.messages = classes[classIndex].messages;
        aClassroom.students = classes[classIndex].students;
        if (classes[classIndex].peerGrades) {
          aClassroom.peerGrades = classes[classIndex].peerGrades;
        }
        studentsClassrooms.push(aClassroom);
      }
      return;
    };

    TA.findMatchingClassroom = function (classCode) {
      for (var classIndex = 0; classIndex < studentsClassrooms.length; classIndex++) {
        if (studentsClassrooms[classIndex].code === classCode) {
          return studentsClassrooms[classIndex];
        }
      }
      return false;
    };

    // adds a new class to studentsClassrooms
    TA.addNewClass = function (classObject) {
      if (containsClass(classObject.code)) {
        // classroom already exists
        return false;
      } else {
        var aClassroom = {};
        aClassroom.subject = classObject.subject;
        aClassroom.code = classObject.code;
        aClassroom.name = classObject.name;
        aClassroom.assignments = classObject.assignments;
        aClassroom.messages = classObject.messages;
        aClassroom.students = classObject.students;
        if (classObject.peerGrades) {
          aClassroom.peerGrades = classObject.peerGrades;
        }
        studentsClassrooms.push(aClassroom);
        return true;
      }
    }

    // search for assignment based on class code and assignmentcode
    TA.findMatchingAssignment = function (classCode, assignmentId) {
      var classroomObject = this.findMatchingClassroom(classCode);
      if (classroomObject === false) {
        // no classroom stored in this service
        return false;
      } else {
        // search for assignment
        for (var assignmentIndex = 0; assignmentIndex < classroomObject.assignments.length; assignmentIndex++) {
          if (classroomObject.assignments[assignmentIndex].assignmentId === assignmentId) {
            console.log('matching assignment found!');
            return classroomObject.assignments[assignmentIndex];
          }
        };
        return false;
      }
    };

    TA.updateClassroom = function (classroomObject) {
      for (var classIndex = 0; classIndex < studentsClassrooms.length; classIndex++) {
        if (studentsClassrooms[classIndex].code === classroomObject.code) {
          studentsClassrooms.splice(classIndex, 1);
          this.addNewClass(classroomObject);
          return;
        }
      }
    };

    TA.getClasses = function () {
      return studentsClassrooms;
    };



    // Teacher functions

    /*
    Returns an array of assignments stored in the service
    */
    TA.getTeacherAssignments = function () {
      return teacherAssignments;
    };

    /*
    Returns an array of teacher classrooms locally stored
    */
    TA.getTeacherClassrooms = function () {
      return teacherClassrooms;
    };

    /*
    Updates the stored array of assignments with a new one (usually passed from the server)
    */
    TA.storeTeacherAssignments = function (assignments) {
      teacherAssignments = assignments;
      console.log(assignments);
      return;
    };

    /*
    Updates the stored array of classrooms with a new one (usually passed from server)
    */
    TA.storeTeacherClassrooms = function (classrooms) {
      teacherClassrooms = classrooms;
      return;
    };

    /*
    Finds a classroom for the teacher while making sure it has the students populated
    */
    TA.findTeacherClassroom = function (classCode) {
      var matchedClass;
      for (var classIndex = 0; classIndex < teacherClassrooms.length; classIndex++) {
        matchedClass = teacherClassrooms[classIndex];
        if (matchedClass.code === classCode) {
          // make sure students information is populated and not an objectId reference
          if (matchedClass.students.length !== 0 && typeof matchedClass.students[0] === 'object'){
            console.log("found matched classroom");
            console.log(matchedClass);
            return matchedClass;
          } else {
            return false;
          }
        }
      }
      return false;
    };

    /*
    Updates teacher classroom list with a classroom that has student information
    If an existing classroom is not stored in the teacherClassrooms array, it adds the passed classroom to the array
    */
    TA.updateTeacherClassrooms = function (classroom) {
      var matchedClass;
      for (var classIndex = 0; classIndex < teacherClassrooms.length; classIndex++) {
        matchedClass = teacherClassrooms[classIndex];
        if (matchedClass.code === classroom.code) {
          matchedClass.students = classroom.students;
          teacherClassrooms[classIndex] = matchedClass;
          return true;
        }
      }
      teacherClassrooms.push(classroom);
      return true;
    };

    /*
    Stores teacher assignment
    */
    TA.setNewAssignment = function (assignmentObject) {
      console.log(assignmentObject);
      newAssignment = assignmentObject;
    };

    /*
    Returns stored assignment
    */
    TA.getNewAssignment = function () {
      return newAssignment;
    };

    return TA;
  });
