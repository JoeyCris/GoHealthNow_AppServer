'use strict';

// Setting up route
angular.module('topicTemplates').config(['$stateProvider',
function($stateProvider) {
  // Template state routing
  $stateProvider.
  state('listTemplates', {
    url: '/templates',
    templateUrl: 'modules/topicTemplates/views/list-topicTemplates.client.view.html'
  }).
  state('createTemplate', {
    url: '/templates/create',
    templateUrl: 'modules/topicTemplates/views/create-topicTemplates.client.view.html'
  }).
  state('createTemplateByType', {
    url: '/templates/create/type/:typeId',
    templateUrl: 'modules/topicTemplates/views/create-topicTemplates.client.view.html'
  }).
  state('viewTemplate', {
    url: '/templates/:templateId',
    templateUrl: 'modules/topicTemplates/views/view-topicTemplates.client.view.html'
  }).
  state('editTemplate', {
    url: '/templates/:templateId/edit',
    templateUrl: 'modules/topicTemplates/views/edit-topicTemplates.client.view.html'
  });
}]);
