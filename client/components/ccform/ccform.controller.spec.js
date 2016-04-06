'use strict';

describe('Controller: CcformCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var CcformCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CcformCtrl = $controller('CcformCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
