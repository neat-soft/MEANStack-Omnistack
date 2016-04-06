'use strict';

angular.module('fsaApp')
  .directive('scrollable', function($timeout) {
    return {
      scope: {
        scrollable: "=",
        scrollableTab: "=",
        userScrollTreshhold: "="
      },
      restrict: 'EA',
      link: function(scope, element) {
        scope.$watchCollection('scrollable', function(newValue, oldValue) {
          if (newValue != oldValue) {
            $timeout(function() {
              var elem;
              if (typeof (newValue[newValue.length - 1].roomID) !== 'undefined') {
                elem = $('#' + newValue[newValue.length - 1].roomID);
                if (elem[0]) {
                  if (elem.scrollTop() + (+scope.userScrollTreshhold) >= (elem[0].scrollHeight - (+scope.userScrollTreshhold))) {
                    elem.scrollTop(elem[0].scrollHeight);
                  }
                }
              } else if (typeof (newValue[newValue.length - 1].notification) !== 'undefined') {
                elem = $('#' + scope.scrollableTab);
                if (elem[0]) {
                  if (elem.scrollTop() + (+scope.userScrollTreshhold) >= (elem[0].scrollHeight - (+scope.userScrollTreshhold))) {
                    elem.scrollTop(elem[0].scrollHeight);
                  }
                }
              }
            });
          }
        });

        scope.$watch(function() {
          return element[0].scrollHeight;
        }, function(newValue, oldValue) {
          if (oldValue == 0) {
            $timeout(function() {
              element.scrollTop(element[0].scrollHeight);
            });
          }
        });
      }
    };
  });
