'use strict';

// Setting up route
angular.module('topics').config(['$stateProvider',
	function($stateProvider) {
		// Articles state routing
		$stateProvider.
		state('listTopics', {
			url: '/topics',
			templateUrl: 'modules/topics/views/list-topic.client.view.html'
		}).
		state('createTopic', {
			url: '/topics/create',
			templateUrl: 'modules/topics/views/create-topic.client.view.html'
		}).
		state('listAnswers', {
			url: '/answers',
			templateUrl: 'modules/topics/views/list-topic-answer.client.view.html'
		}).
		state('listAnswersByUser', {
			url: '/answers/user/:userId',
			templateUrl: 'modules/topics/views/list-user-topic-answer.client.view.html'
		}).
		state('createQuestionAnswer', {
			url: '/answers/create/question/:questionId',
			templateUrl: 'modules/topics/views/create-question-answer.client.view.html'
		}).
		state('createMealAnswer', {
			url: '/answers/create/meal/:mealId',
			templateUrl: 'modules/topics/views/create-meal-answer.client.view.html'
		}).
		state('listReminders', {
			url: '/reminders',
			templateUrl: 'modules/topics/views/list-topic-reminder.client.view.html'
		}).
		state('listRemindersByUser', {
			url: '/reminders/user/:userId',
			templateUrl: 'modules/topics/views/list-user-topic-reminder.client.view.html'
		}).
		state('listNotesByUser', {
			url: '/notes/user/:userId',
			templateUrl: 'modules/topics/views/list-user-note.client.view.html'
		}).
		state('createNoteWithUserId', {
			url: '/notes/create/:userId',
			templateUrl: 'modules/topics/views/create-user-note.client.view.html'
		}).
		state('viewNote', {
			url: '/notes/:noteId',
			templateUrl: 'modules/topics/views/view-note.client.view.html'
		}).
		state('editNote', {
			url: '/notes/:noteId/edit',
			templateUrl: 'modules/topics/views/edit-user-note.client.view.html'
		}).
		state('createReminder', {
			url: '/reminders/create',
			templateUrl: 'modules/topics/views/create-topic-reminder.client.view.html'
		}).
		state('createReminderWithUserId', {
			url: '/reminders/create/:userId',
			templateUrl: 'modules/topics/views/create-topic-reminder-with-user-id.client.view.html'
		}).
		state('viewTopic', {
			url: '/topics/:topicId',
			templateUrl: 'modules/topics/views/view-topic.client.view.html'
		}).
		state('editTopic', {
			url: '/topics/:topicId/edit',
			templateUrl: 'modules/topics/views/edit-topic.client.view.html'
		});
	}
]);
