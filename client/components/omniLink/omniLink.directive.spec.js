'use strict';

describe('Directive: omniLink', function () {

  // load the directive's module
  beforeEach(module('fsaApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<omni-link></omni-link>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the omniLink directive');
  }));
});