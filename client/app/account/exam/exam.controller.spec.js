'use strict';

describe('Controller: ExamCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var ExamCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ExamCtrl = $controller('ExamCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
