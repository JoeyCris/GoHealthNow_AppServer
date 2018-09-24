'use strict';
angular.module('questions').directive('photoUpload', function() {
      //alert();
      return {
        restrict: 'E',
        templateUrl: 'modules/questions/views/upload-photo.html'
      };
    });
