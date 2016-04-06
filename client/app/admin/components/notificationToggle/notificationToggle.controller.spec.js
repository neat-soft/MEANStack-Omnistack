'use strict';

describe('Controller: NotificationToggleCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var NotificationToggleCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NotificationToggleCtrl = $controller('NotificationToggleCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
