'use strict';

describe('Service: SubjectNames', function () {

  // load the service's module
  beforeEach(module('fsaApp'));

  // instantiate service
  var subjectNames;
  beforeEach(inject(function (_subjectNames_) {
    subjectNames = _subjectNames_;
  }));

  it('should do something', function () {
    expect(!!subjectNames).toBe(true);
  });

});
