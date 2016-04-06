'use strict';

describe('Controller: ExamPageCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var ExamPageCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ExamPageCtrl = $controller('ExamPageCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
