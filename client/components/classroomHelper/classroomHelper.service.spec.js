'use strict';

describe('Service: classroomHelper', function () {

  // load the service's module
  beforeEach(module('fsaApp'));

  // instantiate service
  var classroomHelper;
  beforeEach(inject(function (_classroomHelper_) {
    classroomHelper = _classroomHelper_;
  }));

  it('should do something', function () {
    expect(!!classroomHelper).toBe(true);
  });

});
