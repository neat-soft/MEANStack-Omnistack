'use strict';

describe('Controller: ExamEditCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var ExamEditCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ExamEditCtrl = $controller('ExamEditCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
