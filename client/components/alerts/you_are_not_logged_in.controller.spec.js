'use strict';

describe('Controller: YouAreNotLoggedInCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var YouAreNotLoggedInCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    YouAreNotLoggedInCtrl = $controller('YouAreNotLoggedInCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
