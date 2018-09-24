'use strict';

// Setting up route
angular.module('knowledge').config(['$stateProvider',
function($stateProvider) {
  // Knowledge state routing
  $stateProvider.
  state('listKnowledge', {
    url: '/knowledge',
    templateUrl: 'modules/knowledge/views/list-knowledge.client.view.html'
  }).
  state('createKnowledge', {
    url: '/knowledge/create',
    templateUrl: 'modules/knowledge/views/create-knowledge.client.view.html'
  }).
  state('createKnowledgeByType', {
    url: '/knowledge/create/type/:typeId',
    templateUrl: 'modules/knowledge/views/create-knowledge.client.view.html'
  }).
  state('viewKnowledge', {
    url: '/knowledge/:knowledgeId',
    templateUrl: 'modules/knowledge/views/view-knowledge.client.view.html'
  }).
  state('editKnowledge', {
    url: '/knowledge/:knowledgeId/edit',
    templateUrl: 'modules/knowledge/views/edit-knowledge.client.view.html'
  });
}]);
