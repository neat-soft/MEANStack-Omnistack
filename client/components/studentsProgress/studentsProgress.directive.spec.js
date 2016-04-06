'use strict';

describe('Directive: studentsProgress', function () {

  // load the directive's module and view
  beforeEach(module('fsaApp'));
  beforeEach(module('components/studentsProgress/studentsProgress.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<students-progress></students-progress>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the studentsProgress directive');
  }));
});