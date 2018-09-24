'use strict';

// Setting up route
angular.module('email').config(['$stateProvider',
function($stateProvider) {
  // Email state routing
  $stateProvider.
  state('listEmail', {
    url: '/email',
    templateUrl: 'modules/email/views/list-email.client.view.html'
  }).
  state('createEmail', {
    url: '/email/create',
    templateUrl: 'modules/email/views/create-email.client.view.html'
  }).
  state('createEmailByStatus', {
    url: '/email/create/status/:statusId',
    templateUrl: 'modules/email/views/create-email.client.view.html'
  }).
  state('viewEmail', {
    url: '/email/:emailId',
    templateUrl: 'modules/email/views/view-email.client.view.html'
  }).
  state('editEmail', {
    url: '/email/:emailId/edit',
    templateUrl: 'modules/email/views/edit-email.client.view.html'
  });
}]);
