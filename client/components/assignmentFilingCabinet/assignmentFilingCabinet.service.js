'use strict';

angular.module('fsaApp')
  .factory('assignmentFilingCabinet', function ($http) {
    /**
    * Local caching service for assignments.  The filing cabinet is organized by class (e.g. the cabinets)
    * then assignment (e.g. folders/dividers).
    */
    var filingCabinetManager = {};
    var assignmentFilingCabinet = {};
    var questionFilingCabinet = {};

    filingCabinetManager.setFilingCabinet = function(newFilingCabinet) {
      assignmentFilingCabinet = newFilingCabinet;
    };

    // filingCabinetManager.getFilingCabinet = function() {
    //   return assignmentFilingCabinet;
    // };

    // Returns whether an assignment exists in the filing cabinet.
    filingCabinetManager.containsAssignment = function(classCode, assignmentId) {
      return assignmentFilingCabinet[classCode] && assignmentFilingCabinet[classCode][assignmentId];
    };

    // Updates and existing assignment or adds a new assignment if the assignment does not exist.
    filingCabinetManager.addAssignment = function(classCode, assignment) {
      if(!assignmentFilingCabinet[classCode]) {
        assignmentFilingCabinet[classCode] = {};
      }

      assignmentFilingCabinet[classCode][assignment._id] = assignment;
    };

    // Alias for addAssignment.
    filingCabinetManager.updateAssignment = filingCabinetManager.addAssignment;

    // Delete Assignment
    filingCabinetManager.deleteAssignment = function(assignmentCode){
      var currentAssignmentIndex = -1;
      for (var assignmentIndex = 0; assignmentIndex < assignmentFilingCabinet.length; assignmentIndex++){
        if (assignmentFilingCabinet[assignmentIndex].code == assignmentCode){
          currentAssignmentIndex = assignmentIndex;
          break;
        }
      }
      if (currentAssignmentIndex >-1){
        $http.delete('api/assignments/'+assignmentFilingCabinet[currentAssignmentIndex]._id);
        assignmentFilingCabinet.splice(currentAssignmentIndex,1);
      }
    };
    // Adds an assignment to the filing cabinet if it does not already exist by requesting the
    // assignment from the server.  In either case, when the function completes,
    // callback(error, assignment) is called.
    filingCabinetManager.asyncAddAssignment = function(classCode, assignmentId, callback) {
      if(!assignmentFilingCabinet[classCode] || !assignmentFilingCabinet[classCode][assignmentId]) {
        $http.get('/api/assignments/' + assignmentId + '/withQuestions').then(
          function(serverResponse) {
            filingCabinetManager.addAssignment(classCode, serverResponse.data);

            callback(null, serverResponse.data);
          }, function(serverResponse) {
            callback(serverResponse.data, null);
          }
        );
      } else {
        callback(null, assignmentFilingCabinet[classCode][assignmentId]);
      }
    };

    // Updates an assignment by requesting the assignment from the server regardless of whether
    // it is cached locally or not.
    filingCabinetManager.asyncUpdateAssignment = function(classCode, assignmentId, callback) {
      $http.get('/api/assignments/' + assignmentId + '/withQuestions').then(
        function(serverResponse) {
          filingCabinetManager.addAssignment(classCode, serverResponse.data);
          callback(null, serverResponse.data);
        }, function(serverResponse) {
          callback(serverResponse.data, null);
        }
      );
    };

    // Finds and returns the specified assignment based on class code and assignment _id.
    filingCabinetManager.getAssignment = function(classCode, assignmentId) {
      if(assignmentFilingCabinet[classCode] && assignmentFilingCabinet[classCode][assignmentId]) {
        return assignmentFilingCabinet[classCode][assignmentId];
      }

      return false;
    };

    // Alias for asyncAddAssignment
    filingCabinetManager.asyncGetAssignment = filingCabinetManager.asyncAddAssignment;

    // Returns all assignments for a class.
    filingCabinetManager.getAllAssignmentsForClass = function(classCode) {
      var classAssignments = [];
      var classAssignmentIds = Object.keys(assignmentFilingCabinet[classCode]);
      for(var assignmentIndex = classAssignments.length - 1; assignmentIndex >= 0; assignmentIndex--) {
        classAssignments.push(assignmentFilingCabinet[classCode][classAssignmentIds[assignmentIndex]]);
      }

      return classAssignments;
    };

    return filingCabinetManager;
  });
