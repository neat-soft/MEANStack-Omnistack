'use strict';

angular.module('fsaApp')
  .directive('omniLink', function ($location) {
    return function($scope, $element, $attributes) {
    var tapped;
    tapped = false;
    $element.bind('click', function() {
      if (!tapped) {
        return $location.path($attributes['omniLink']);
      }
    });
    $element.bind('touchstart', function(event) {
      return tapped = true;
    });
    $element.bind('touchmove', function(event) {
      tapped = false;
      return event.stopImmediatePropagation();
    });
    return $element.bind('touchend', function() {
      if (tapped) {
        return $location.path($attributes['omniLink']);
      }
    });
  };
  });
