'use strict';

describe('Controller: TeacherCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var TeacherCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TeacherCtrl = $controller('TeacherCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
