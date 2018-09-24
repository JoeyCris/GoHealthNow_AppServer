'use strict';

// Questions controller
angular.module('questions').controller('QuestionsController', ['$scope', '$stateParams', '$location', 'Admin','Authentication', 'UserQuestions', 'UserCatergorizedQuestions', 'Questions', 'Topics', 'Profiles', 'QuestionTypes', 'Upload','$modal','filterFilter',
	function($scope, $stateParams, $location, Admin, Authentication, UserQuestions, UserCatergorizedQuestions, Questions , Topics, Profiles, QuestionTypes, Upload, $modal, filterFilter) {
		$scope.authentication = Authentication;
		$scope.profiles = Profiles.query();
		$scope.types = QuestionTypes.query();
		$scope.selectedType = 'Diet';
		$scope.maxSize = 5;
		$scope.numPerPage = 3;
		$scope.currentState = {
			state: 'Unanswered',
			currentPage: 1,
			currentPageBack: 1,
			allQuestions: [],
			filteredQuestions: [],
			questions: [],
			totalNum: 0
		};

		$scope.listQuestionsInit = function(){
			$scope.selectedState = 'Unanswered';
			$scope.questionStates = [{
				state: 'Unanswered',
				currentPage: 1,
				currentPageBack: 1,
				allQuestions: [],
				filteredQuestions: [],
				questions: [],
				totalNum: 0
			},{
				state: 'Answered',
				currentPage: 1,
				currentPageBack: 1,
				allQuestions: [],
				filteredQuestions: [],
				questions: [],
				totalNum: 0
			},{
					state: 'All',
					currentPage: 1,
					currentPageBack: 1,
					allQuestions: [],
					filteredQuestions: [],
					questions: [],
					totalNum: 0
			}];
			$scope.currentState = $scope.questionStates[0];
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
			Questions.query(function(questions){
				questions.forEach(function(question){
					$scope.questionStates[0].allQuestions.push(question);
					if (question.replyTimes === 0){
						$scope.questionStates[1].allQuestions.push(question);
					}else{
						$scope.questionStates[2].allQuestions.push(question);
					}
				});
				for(var i in [0, 1, 2]) {
					$scope.questionStates[i].filteredQuestions = $scope.questionStates[i].allQuestions;
					$scope.questionStates[i].totalNum = $scope.questionStates[i].allQuestions.length;
					$scope.questionStates[i].questions = $scope.questionStates[i].allQuestions.slice(0, $scope.numPerPage);
				}
				console.log($scope.currentState.totalNum);
			});
			setTimeout(function() {
				modalInstance.close({ isInitialized: true});
			}, 500);

		};

		$scope.$watch('currentState.currentPage + currentState.numPerPage', function() {
			var currentState = $scope.currentState;
			var begin = $scope.numPerPage * (currentState.currentPage-1);
			var end = begin + $scope.numPerPage;
			$scope.currentState.questions = $scope.currentState.filteredQuestions.slice(begin, end);
			if($scope.search === '') {
				currentState.currentPageBack = currentState.currentPage;
			}
		});

		$scope.$watch('search', function(newVal, oldVal) {
			if(newVal === oldVal) {
				return;
			}
			var currentState = $scope.currentState;
			if(newVal) {
				var filteredQuestions = filterFilter(currentState.allQuestions, newVal);
				currentState.filteredQuestions = filteredQuestions;
				if(currentState.filteredQuestions.length) {
					currentState.currentPage = 1;
				}
			} else {
				currentState.filteredQuestions = currentState.allQuestions;
				console.log(currentState.filteredQuestions);
				console.log(currentState.allQuestions);
				currentState.currentPage = currentState.currentPageBack;
			}

			var begin = (currentState.currentPage-1) * $scope.numPerPage;
			var end = begin + $scope.numPerPage;
			console.log(currentState.currentPage);
			currentState.questions = currentState.filteredQuestions.slice(begin, end);
			console.log(currentState.questions);


			currentState.totalNum = currentState.filteredQuestions.length;

		});

		$scope.getURL = function(uri) {
			var fullURL = $location.protocol + '//' +$location.hostname + uri;

			console.log('full url:' + fullURL);
			return fullURL;
		};

		$scope.listQuestionsByUserInit = function(){
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
			$scope.selectedState = 'All';
			$scope.questionStates = [{
				state: 'All',
				questions: []
			},{
				state: 'Unanswered',
				questions: []
			},{
				state: 'Answered',
				questions: []
			}];
			//$scope.user = Admin.get({userId: $stateParams.userId}, function(res) {
			//	console.log(res);
			//});
			$scope.questionStates[0].questions = UserQuestions.getQuestionByUser({userId:$stateParams.userId}, function(){
				setTimeout(function () {
					modalInstance.close({isInitialized: true});
				}, 500);
			});
			$scope.questionStates[1].questions = UserCatergorizedQuestions.getQuestionByUser({userId:$stateParams.userId, answerType: 'unanswered'});
			$scope.questionStates[2].questions = UserCatergorizedQuestions.getQuestionByUser({userId:$stateParams.userId, answerType: 'answered'});
		};

		$scope.selectState = function(state){
			$scope.selectedState = state;
			$scope.currentState = $scope.questionStates[['All', 'Unanswered', 'Answered'].indexOf(state)];
			$scope.currentPage = $scope.currentState.currentPage;
			$scope.totalNum = $scope.currentState.totalNum;
			console.log($scope.currentState);
		};

		$scope.isStateSelected = function(state){
			if($scope.selectedState === state){
				return true;
			}else{
				return false;
			}
		};

		$scope.isDietitian = function(){
		//	alert(Authentication.user.roles.toString());
			return Authentication.user.roles.toString() === 'dietitian';
		};

		$scope.isSet = function(selectedType){
			if($scope.selectedType === selectedType){
				return true;
			}else{
				return false;
			}
		};

		$scope.setType = function(selectedType){
			$scope.selectedType = selectedType;
		};

		$scope.$watch('photos', function () {
			var photos = $scope.photos;
        if(photos){
					$scope.upload(photos);
					//$scope.medias = photos;
					//alert(JSON.stringify(photo) + ' ' + (URL.createObjectURL));
					//$scope.photoURL = URL.createObjectURL($scope.files);
				}

    });

		$scope.selectmedia = function(media){
			//alert(JSON.stringify(photo));
			$scope.premedia = media;
		};

		$scope.upload = function (files) {
        if (files && files.length) {
						// var returnSuccess = function (data, status, headers, config) {
						// 		console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
						// };
						var medias = [];
						files.forEach(function(element, index, array){
							var file = element;
							//alert(JSON.stringify(element));
							Upload.upload({
									url: '/fileupload',
									fields: {'user_id': Authentication.user.userID, 'type': 1},
									file: file
							})
							.progress(function (evt) {
							    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
							    //console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
							}).success(function (data, status, headers, config) {
									medias.push(data);
									$scope.medias = medias;
									//alert('file ' + config.file.name + 'uploaded. Response: ' + JSON.stringify(data));
							});
						});




            // for (var i = 0; i < files.length; i++) {
            //   var file = files[i];
            //   Upload.upload({
            //       url: '/fileupload',
            //       fields: {'user_id': Authentication.user.userID},
            //       file: file
            //   })
						// 	.progress(function (evt) {
            //       var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            //       console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
						// 	}).success(returnSuccess);
            // }
        }
    };

		// Create new Question
		$scope.create = function() {
			// Create new Question object
			var question = new Questions({
				userID: Authentication.user.userID,
			  // userID: "5581d53de14880ad3fd22a72",
				questionType: this.type,
				questionContent: this.content,
				medias: $scope.medias
			});

			// Redirect after save
			question.$save(function(response) {
				$location.path('questions/' + response._id);

				// Clear form fields
				$scope.type = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Question
		$scope.remove = function(question) {
			var confirmDelete = confirm('Are you sure to delete this Question?');
			// alert(confirmDelete);
			if(confirmDelete){
				if (question) {
					question.$remove();

					for (var i in $scope.questions) {
						if ($scope.questions[i] === question) {
							$scope.questions.splice(i, 1);
						}
					}
				} else {
					$scope.question.$remove(function() {
						$location.path('questions');
					});
				}
			}
		};

		// Update existing Question
		$scope.update = function() {
			var question = $scope.question;
			question.medias = $scope.medias;

			question.$update(function() {
				$location.path('questions/' + question._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Questions
		$scope.find = function() {
			QuestionTypes.query(function(types){
				var questionTypes = [];
				types.forEach(function(element, index, array){
					questionTypes.push({type:element,questions:QuestionTypes.getQuestionByType({typeId:index})});
					$scope.questionTypes = questionTypes;
				});
			});
			$scope.questions = Questions.query();
		};

		// Find existing Question
		$scope.findOne = function(topic) {
			$scope.question = Questions.get({
				questionId: $stateParams.questionId
			},function(question){
				$scope.medias = question.medias;

				if(question.noteAudio) {
					var fullURL = $location.protocol() + '://' +location.host + question.noteAudio;

					$scope.question.audioURL = fullURL;

				}

			});

		};

	}
]);
