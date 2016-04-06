'use strict';

describe('Controller: ChatroomCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var ChatroomCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ChatroomCtrl = $controller('ChatroomCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
