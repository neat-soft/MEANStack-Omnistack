'use strict';

angular.module('fsaApp')
  .directive('omnicordion', function () {
    return {
      template: '<div data-ng-transclude=""></div>',
      restrict: 'EA',
      replace: true,
      transclude: true,
      controller: function () {
        var expanders = [];

        this.gotOpened = function ( selected_expander )
        {
          angular.forEach( expanders, function ( expander )
          {
            if ( selected_expander != expander )
                expander.showMe = false;
          } );
        };

        this.addExpander = function ( expander )
        {
          expanders.push( expander );
        };
      }
    };
  })
  .directive('expander', function () {
    return {
      restrict  : 'EA',
      replace   : true,
      transclude: true,
      require   : '^omnicordion',
      scope     : {
        title: '@expanderTitle'
      },
      templateUrl: 'components/omnicordion/omnicordion.html',
      link      : function ( scope, element, attrs, accordionController ) {
        scope.showMe = false;
        accordionController.addExpander( scope );
        scope.toggle = function ()
        {
          scope.showMe = !scope.showMe;
          accordionController.gotOpened( scope );
        };
      }
    }
  });