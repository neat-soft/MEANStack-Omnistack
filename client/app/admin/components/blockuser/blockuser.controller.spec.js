'use strict';

describe('Controller: BlockuserCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var BlockuserCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    BlockuserCtrl = $controller('BlockuserCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
