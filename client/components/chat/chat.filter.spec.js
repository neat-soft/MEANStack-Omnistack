'use strict';

describe('Filter: chat', function () {

  // load the filter's module
  beforeEach(module('fsaApp'));

  // initialize a new instance of the filter before each test
  var chat;
  beforeEach(inject(function ($filter) {
    chat = $filter('chat');
  }));

  it('should return the input prefixed with "chat filter:"', function () {
    var text = 'angularjs';
    expect(chat(text)).toBe('chat filter: ' + text);
  });

});
