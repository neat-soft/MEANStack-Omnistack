'use strict';

describe('Controller: SurveyModalCtrl', function () {

  // load the controller's module
  beforeEach(module('fsaApp'));

  var SurveyModalCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SurveyModalCtrl = $controller('SurveyModalCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
