'use strict';

angular.module('fsaApp')
  .directive('omniEditor', function () {
    return {
      templateUrl: 'components/omniEditor/omniEditor.html',
      restrict: 'E',
      scope: {
        name: '@',
        ngHeight: '@',
        ngModel: '='
      },
      controller: ['$scope', function($scope) {
        $scope.editorOptions = {
          toolbar: [
            { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline' ] },
            { name: 'links', items: [ 'Link', 'Unlink' ] },
            { name: 'insert', items: [ 'Mathjax', 'Image' ] }
          ],
          height: $scope.ngHeight
        };

        $scope.test = function(){
          console.log($scope.name);
          console.log($scope.ngHeight);
          console.log($scope.ngModel);
        }
      }]
    }
  });

