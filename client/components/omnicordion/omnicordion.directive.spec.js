'use strict';

describe('Directive: examAccordion', function () {

  // load the directive's module
  beforeEach(module('fsaApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<exam-accordion></exam-accordion>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the examAccordion directive');
  }));
});