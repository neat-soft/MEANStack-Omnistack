'use strict';

describe('Service: assignmentFilingCabinet', function () {
  var $httpBackend, assignmentRequestHandler;
  var spoofedBackendResponse = {
    data: {
      _id:      "122adfe24542adfe",
      name:       "Test Assignment",
      type:       "Quiz",
      pointsPossible: 50,
      questions:    [
        {
          subject:    "Aliens",
          author:     12345,
          authorEmail:  "12345@teacher.com",
          oldId:      "12345",
          value:      2,
          examNumber:   1,
          body:       "The Best Choice",
          part:       1,
          answer:     "The Worse Choice",
          topics:     [],
          explanation:  "Expect the unexpected",
          images:     {},
          comments:     [],
          choices:    [],
          timesSkipped:   0,
          timesAnswered:  1,
          tags:       ["aliens"],
          type:       "Mult",
          score:      54,
          votes:      {}
        }
      ],
      author:     12345,
      subject:    "Aliens",
      code:       "a123adsb"
    }
  };

  // load the service's module
  beforeEach(function() {
    module('fsaApp');

    module(function ($provide) {
      $provide.value('assignmentFilingCabinet', _assignmentFilingCabinet_);
    });
  });

  // instantiate service
  var assignmentFilingCabinet;
  beforeEach(inject(function (_assignmentFilingCabinet_) {
    assignmentFilingCabinet = _assignmentFilingCabinet_;
  }));

  // Inject mock $http
  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');

    assignmentRequestHandler = $httpBackend.when('GET', '/api/assignment/:assignmentId').respond(spoofedBackendResponse);
  }));

  describe("containsAssignment", function() {
    it('should return false when neither the class code does not exist in the filing cabinet', function () {
      console.log("TESTS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
      expect(assignmentFilingCabinet.containsAssignment(1234, "abcd")).toBe(false);
    });

    it('should return false when the class code exists, but the assignment does not.', function() {
      assignmentFilingCabinet.setFilingCabinet({
        1234:   {}
      });

      expect(assignmentFilingCabinet.containsAssignment(1234, "abcd")).toBe(false);
    });

    it('should return true when the assignment is cached locally.', function() {
      assignmentFilingCabinet.setFilingCabinet = ({
        1234:   {
          abcd:   {
            name: "Temp Assignment"
          }
        }
      });

      expect(assignmentFilingCabinet.containsAssignment(1234, "abcd")).toBe(true);
    });
  });

  describe("addAssignment", function() {
    it('should be able to add an assignment even when the class does not exist yet.', function() {
      var newTestAssignment = {
        _id:      "122adfe24542adfe",
        name:       "Test Assignment"
      };

      assignmentFilingCabinet.addAssignment(1234, newTestAssignment);
      expect(assignmentFilingCabinet.getFilingCabinet()[1234]["122adfe24542adfe"]).toEqual(newTestAssignment);
    });

    it('should add an assignment if the class exists, but the assignment does not.', function() {
      var newTestAssignment = {
        _id:      "122adfe24542adfe",
        name:       "Test Assignment"
      };

      assignmentFilingCabinet.setFilingCabinet = ({
        1234:   {
          abcd:   {}
        }
      });

      assignmentFilingCabinet.addAssignment(1234, newTestAssignment);
      expect(assignmentFilingCabinet.getFilingCabinet()[1234]["122adfe24542adfe"]).toEqual(newTestAssignment);
    });

    it('should update an assignment if the assignment already exists.', function() {
      var newTestAssignment = {
        _id:      "122adfe24542adfe",
        name:       "Test Assignment"
      };

      assignmentFilingCabinet.setFilingCabinet = ({
        1234:   {
          "122adfe24542adfe":   {
            pointsPossible:   900
          }
        }
      });

      assignmentFilingCabinet.addAssignment(1234, newTestAssignment);
      expect(assignmentFilingCabinet.getFilingCabinet()[1234]["122adfe24542adfe"]).toEqual(newTestAssignment);
    });
  });
  
  describe("getAssignment", function() {
    it('should return an assignment when it exists.', function() {
      var newTestAssignment = {
        _id:      "122adfe24542adfe",
        name:       "Test Assignment"
      };

      assignmentFilingCabinet.setFilingCabinet = ({
        1234:   {
          "122adfe24542adfe":   newTestAssignment
        }
      });

      expect(assignmentFilingCabinet.getAssignment(1234, "122adfe24542adfe")).toEqual(newTestAssignment);
    });

    it('should return false when an assignment does not exist.', function() {
      expect(assignmentFilingCabinet.getAssignment(1234, "122adfe24542adfe")).toBe(false);
    });
  });

  describe("asyncAddAssignment", function() {
    it('should return an assignment if it is already cached locally.', function() {
      var newTestAssignment = {
        _id:      "122adfe24542adfe",
        name:       "Test Assignment"
      };

      assignmentFilingCabinet.setFilingCabinet = ({
        1234:   {
          "122adfe24542adfe":   newTestAssignment
        }
      });

      assignmentFilingCabinet.asyncAddAssignment(1234, "122adfe24542adfe", function(error, assignment) {
        expect(error).toBe(null);
        expect(assignment).toEqual(newTestAssignment);
        expect(assignmentFilingCabinet.getFilingCabinet()[1234]["122adfe24542adfe"]).toEqual(newTestAssignment);
      });
    });

    it('should return an assignment from the server if it does not exist locally,', function() {
      assignmentFilingCabinet.asyncAddAssignment(1234, "122adfe24542adfe", function(error, assignment) {
        expect(error).toBe(null);
        expect(assignment).toEqual(spoofedBackendResponse.data);
        expect(assignmentFilingCabinet.getFilingCabinet()[1234]["122adfe24542adfe"]).toEqual(spoofedBackendResponse.data);
      });
    });
  });

  describe("asyncUpdateAssignment", function() {
    it('should update the local cache by retreiving the assignment from the server.', function() {
      var newTestAssignment = {
        _id:      "122adfe24542adfe",
        name:       "Test Assignment"
      };

      assignmentFilingCabinet.setFilingCabinet = ({
        1234:   {
          "122adfe24542adfe":   newTestAssignment
        }
      });

      assignmentFilingCabinet.asyncUpdateAssignment(1234, "122adfe24542adfe", function(error, assignment) {
        expect(error).toBe(null);
        expect(assignment).toEqual(spoofedBackendResponse.data);
        expect(assignmentFilingCabinet.getFilingCabinet()[1234]["122adfe24542adfe"]).toEqual(spoofedBackendResponse.data);
      });
    });

    it('should add an assignment when it is not cached locally.', function() {
      assignmentFilingCabinet.asyncUpdateAssignment(1234, "122adfe24542adfe", function(error, assignment) {
        expect(error).toBe(null);
        expect(assignment).toEqual(spoofedBackendResponse.data);
        expect(assignmentFilingCabinet.getFilingCabinet()[1234]["122adfe24542adfe"]).toEqual(spoofedBackendResponse.data);
      });
    });
  });
});
