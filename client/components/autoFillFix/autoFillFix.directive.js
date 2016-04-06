'use strict';

angular.module('fsaApp')
  .directive('autoFillFix', function () {
    return {
      restrict: 'A',
      priority: -10,
      link: function (scope, element) {

        element.on('submit', function () {
          element.find('input, textarea, select').trigger('input').trigger('change').trigger('keydown');
        });

      }
  };
  });
