'use strict';

describe('Directive: omniEditor', function () {

  // load the directive's module and view
  beforeEach(module('fsaApp'));
  beforeEach(module('components/omniEditor/omniEditor.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<omni-editor></omni-editor>');
    element = $compile(element)(scope);
    scope.$apply();
  }));
});
