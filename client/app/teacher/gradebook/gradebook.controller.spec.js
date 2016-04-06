'use strict';

describe('Controller: GradebookCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var GradebookCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GradebookCtrl = $controller('GradebookCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
  });
});
