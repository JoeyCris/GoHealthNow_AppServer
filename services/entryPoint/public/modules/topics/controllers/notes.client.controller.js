/**
 * Created by Canon on 2016-03-31.
 */
'use strict';

angular.module('topics').controller('NotesController', ['$scope', '$http','$stateParams', '$location', 'Admin','Authentication', 'Notes', 'Profiles', 'Comments', 'Questions', 'Meals', 'Knowledge', 'TopicTypes', 'TopicTemplates', 'TemplateTypes', 'Upload', 'QuestionAnswers', 'MealAnswers', 'Reminders', 'NotesByUser','$modal',
	function($scope, $http, $stateParams, $location, Admin, Authentication, Notes, Profiles, Comments, Questions, Meals, Knowledge, TopicTypes, TopicTemplates, TemplateTypes, Upload, QuestionAnswers, MealAnswers, Reminders, NotesByUser, $modal) {
		$scope.authentication = Authentication;
		$scope.userNotes = [];

		$scope.remove = function(note) {
			if (note) {
				note.$remove();

				for (var i in $scope.notes) {
					if ($scope.notes[i] === note) {
						$scope.notes.splice(i, 1);
					}
				}
			} else {
				var userId = $scope.note.user._id;
				$scope.note.$remove(function() {
					$location.path('notes/user/' + userId);
				});
			}
		};

		// Update existing Topic
		$scope.update = function() {
			var note = $scope.note;
			note.creator = Authentication.user.userID;
			note.medias = $scope.medias;
			console.log(note);

			note.$update(function() {
				$location.path('notes/' + note._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.createNoteWithUserIdInit = function(){
			var t = '<div class="modal-header">'+
				'<h4>LOADING...</h4>' +
				'</div>';

			var modalInstance = $modal.open({
				animation: true,
				template:  t
			});
			modalInstance.result.then(function (result) {
				$scope.initialized = result.isInitialized;
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
			Profiles.get({userId: $stateParams.userId}, function (profile) {
				$scope.receiveuser = profile._id;
				$scope.receiveemail = profile.email;
				$scope.user = profile;
				if (profile.firstName && profile.lastName) {
					$scope.displayName = profile.firstName + ' ' + profile.lastName;
				} else {
					$scope.displayName = $scope.receiveemail.split('@')[0];
				}
				setTimeout(function () {
					modalInstance.close({isInitialized: true});
				}, 500);

			});
		};

		$scope.createNote = function() {
			// Create new Topic object
			var note = new Notes({
				user: this.receiveuser,
				signature: this.signature,
				creator: Authentication.user.userID,
				description: this.description,
				medias: $scope.medias,
				link: this.link
			});


			// Redirect after save
			note.$save(function(response) {
				$location.path('notes/' + response._id);

				// Clear form fields
				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});


		};


		$scope.findNotesByUser = function() {
			var t = '<div class="modal-header">'+
				'<h4>LOADING...</h4>' +
				'</div>';
			$scope.userId = $stateParams.userId;

			var modalInstance = $modal.open({
				animation: true,
				template:  t
			});
			modalInstance.result.then(function (result) {
				$scope.initialized = result.isInitialized;
			}, function () {
				console.log('Modal dismissed at: ' + new Date());
			});
			NotesByUser.getNotesForOneUser({userId:$stateParams.userId}, function(res) {
				$scope.userNotes = res;
				//$scope.topics = $scope.allTopics.slice(0, $scope.numPerPage);
				setTimeout(function () {
					modalInstance.close({isInitialized: true});
				}, 500);
			});
		};

		$scope.findOne = function() {
			$scope.note = Notes.get({
				noteId: $stateParams.noteId
			},function(note){
				if(note){
					$scope.question = note.reference;
				}
				if(note.medias === undefined || note.medias.length === 0){
					note.medias = undefined;
				}
				$scope.medias = note.medias;
			});

		};

		$scope.$watch('photos', function () {
			var photos = $scope.photos;
			if(photos){
				$scope.upload(photos);
			}

		});

		$scope.upload = function (files) {
			if (files && files.length) {
				var medias = [];
				files.forEach(function(element, index, array){
					var file = element;
					Upload.upload({
							url: '/fileupload',
							fields: {'user_id': Authentication.user.userID, 'type': 2},
							file: file
						})
						.progress(function (evt) {
							var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
						}).success(function (data, status, headers, config) {
						medias.push(data);
						$scope.medias = medias;
					});
				});
			}
		};

		$scope.selectmedia = function(media){
			// alert(JSON.stringify(photo));
			$scope.premedia = media;
		};


		$scope.toggleMedia = function(media) {
			console.log('media', media);
			console.log('p', $scope.premedia);
			if(typeof $scope.premedia === 'undefined') {
				$scope.premedia = media;
			} else {
				$scope.premedia = undefined;
			}
		};

		$scope.selectqmedia = function(media){
			// alert(JSON.stringify(photo));
			$scope.preqmedia = media;
		};
	}
]);
