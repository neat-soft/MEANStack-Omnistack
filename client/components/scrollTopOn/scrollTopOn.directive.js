'use strict';

angular.module('fsaApp')
  .directive('scrollTopOn', function ($timeout) {
    function link (scope, element, attrs) {
      scope.$on(attrs.scrollTopOn, function () {
        $timeout(function () {
          angular.element(element)[0].scrollTop = 0;
        });
      });
    }
    return link;
  });
