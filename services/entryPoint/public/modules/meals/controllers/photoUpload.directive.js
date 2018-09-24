'use strict';
angular.module('meals').directive('photoUpload', function() {
      //alert();
      return {
        restrict: 'E',
        templateUrl: 'modules/meals/views/upload-photo.html'
      };
    });
