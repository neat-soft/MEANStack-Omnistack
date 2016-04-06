'use strict';

describe('Controller: AddChatRoomCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var AddChatRoomCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddChatRoomCtrl = $controller('AddChatRoomCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
