'use strict';

describe('Controller: SubjectsTaughtCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var SubjectsTaughtCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SubjectsTaughtCtrl = $controller('SubjectsTaughtCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
