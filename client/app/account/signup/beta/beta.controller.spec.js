'use strict';

describe('Controller: BetaCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var BetaCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    BetaCtrl = $controller('BetaCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
