'use strict';

describe('Controller: ChatarchiveCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var ChatarchiveCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ChatarchiveCtrl = $controller('ChatarchiveCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
