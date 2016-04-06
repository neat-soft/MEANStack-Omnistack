'use strict';

describe('Controller: PrivacyCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var PrivacyCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PrivacyCtrl = $controller('PrivacyCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
