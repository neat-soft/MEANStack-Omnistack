'use strict';

describe('Controller: LivechatCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var LivechatCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    LivechatCtrl = $controller('LivechatCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
