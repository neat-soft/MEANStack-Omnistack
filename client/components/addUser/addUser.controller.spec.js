'use strict';

describe('Controller: AddUserCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var AddUserCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddUserCtrl = $controller('AddUserCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
