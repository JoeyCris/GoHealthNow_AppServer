'use strict';

// Topics controller
angular.module('topics').controller('TopicsController', ['$scope', '$http','$stateParams', '$location', 'Admin','Authentication', 'Topics', 'Profiles', 'Comments', 'Questions', 'Meals', 'Knowledge', 'TopicTypes', 'TopicTemplates', 'TemplateTypes', 'Upload', 'QuestionAnswers', 'MealAnswers', 'Reminders', 'TopicTypesByUser','$modal',
	function($scope, $http, $stateParams, $location, Admin, Authentication, Topics, Profiles, Comments, Questions, Meals, Knowledge, TopicTypes, TopicTemplates, TemplateTypes, Upload, QuestionAnswers, MealAnswers, Reminders, TopicTypesByUser, $modal) {
		$scope.authentication = Authentication;

		$scope.checkpush = { sendPush : true, sendEmail : false };
		$scope.checkResults = [];

		//for audio
		$scope.startReadonly=false;
		$scope.stopReadonly=true;
		$scope.deleteReadonly=true;
		$scope.linkReadonly=false;
		$scope.aurl='';
		$scope.aurlshow=false;
		$scope.audioid=0;

		$scope.numPerPage = 10;
		$scope.maxSize = 10;
		$scope.currentLargePage = 1;
		$scope.currentPage = 1;
		$scope.numPerLargePage = 100;
		$scope.pageInterval = $scope.numPerLargePage / $scope.numPerPage;

		$scope.allTopics = [];
		$scope.topics = [];
		$scope.allTopicTypes = {
			'message': [],
			'tip': [],
			'answer': [],
			'reminder': [],
			'announcement': [],
			'instruction': []
		};
		$scope.topicTypes = {};
		$scope.typeName = 'all';
		$scope.typeId = -1;
		var types = ['message','tip','answer','reminder','announcement','instruction'];
		$scope.topicTypesEnum = function(typeName) {
			//var types = ['message','tip','answer','reminder','announcement','instruction'];
			return types.indexOf(typeName);
		};


		$scope.updateTopicsList = function(cb) {
			console.log('currentPage: ', $scope.currentPage);
			if($scope.currentLargePage !== Math.floor(($scope.currentPage-1) / $scope.pageInterval) + 1) {
				//update the user list
				$scope.currentLargePage  = Math.floor(($scope.currentPage-1) / $scope.pageInterval) + 1;
				if($scope.typeId === -1 && $scope.typeName === 'all') {
					// update all topics
					$scope.allTopics = Topics.query({
						numPerPage: $scope.numPerLargePage,
						currentPage: $scope.currentLargePage
					}, function () {
						cb();
					});
				} else {
					$scope.allTopicTypes[$scope.typeName] = TopicTypes.getTopicByType({
						typeId:$scope.typeId,
						numPerPage: $scope.numPerLargePage,
						currentPage: $scope.currentLargePage
					}, function() {
						cb();
					});
				}
			} else {
				cb();
			}
		};
		$scope.$watch('currentPage + numPerPage', function() {
			$scope.updateTopicsList(function() {
				var begin = ($scope.currentPage -1) % $scope.pageInterval * $scope.numPerPage;
				var end = begin + $scope.numPerPage;
				if($scope.typeId === -1 && $scope.typeName === 'all') {
					$scope.topics = $scope.allTopics.slice(begin, end);
				} else {
					$scope.topicTypes[$scope.typeName] = $scope.allTopicTypes[$scope.typeName].slice(begin, end);
				}

			});
		});


		//$scope.modernBrowsers = [
		//	{ icon: "<img src=[..]/opera.png.. />",               name: "Opera",              maker: "(Opera Software)",        ticked: true  },
		//	{ icon: "<img src=[..]/internet_explorer.png.. />",   name: "Internet Explorer",  maker: "(Microsoft)",             ticked: false },
		//	{ icon: "<img src=[..]/firefox-icon.png.. />",        name: "Firefox",            maker: "(Mozilla Foundation)",    ticked: true  },
		//	{ icon: "<img src=[..]/safari_browser.png.. />",      name: "Safari",             maker: "(Apple)",                 ticked: false },
		//	{ icon: "<img src=[..]/chrome.png.. />",              name: "Chrome",             maker: "(Google)",                ticked: true  }
		//];

		$scope.$watch('link', function() {
			// alert($scope.link);
			var value = $scope.link;
			if(value && !/^(https?):\/\//i.test(value) && 'http://'.indexOf(value) !== 0 && 'https://'.indexOf(value) !== 0 ) {
				$scope.link = 'http://' + value;
			}
			else
				$scope.link = value;
		});

		// $scope.$watch('template', function() {
		// 	alert($scope.template);
		// 	TopicTemplates.get({templateId:$scope.template},function(k){
		// 		alert(k);
		// 		// $scope.type = 'tip';
		// 		$scope.description = k.content;
		// 		$scope.medias = k.medias;
		// 		$scope.link = k.link;
		// 	});
		// });


		$scope.$watchCollection('checkpush', function () {
			$scope.checkResults = [];
			angular.forEach($scope.checkpush, function (value, key) {
				if (value) {
					$scope.checkResults.push(key);
				}
			});
		});

		var photoRootUrl = '/images/';

		$scope.$watch('photos', function () {
			var photos = $scope.photos;
			if(photos){
				$scope.upload(photos);
			}

		});

		$scope.selectmedia = function(media){
			$scope.premedia = media;
		};

		$scope.upload = function (files) {
			console.log('upload ready!!');
			if (files && files.length) {
				 
				var medias = []; 
				// // alert(this.receiveuser);
				if(!$scope.user_id){

					if(! $scope.receiveuser && (! $scope.selectedUsers || $scope.selectedUsers.length === 0)) {
						alert('Please select the user first!');
						return;
					} else {
						var users = [];
						$scope.error = null;

						if ($scope.receiveuser) {
							$scope.user_id = $scope.receiveuser;
						} else {


							$scope.user_id = $scope.selectedUsers[0].id;
						}
					}

				}

				files.forEach(function(element, index, array){
					var file = element;
					//alert(JSON.stringify(element));
					Upload.upload({
						url: '/fileupload',
						fields: {'user_id': $scope.user_id, 'type': 2},
						file: file
					})
						.progress(function (evt) {
							var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
							//console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
						}).success(function (data, status, headers, config) {
							//alert(JSON.stringify(data));
							medias.push(data);
							$scope.medias=medias;
							//alert('file ' + config.file.name + 'uploaded. Response: ' + JSON.stringify(data));
						});
				});
				//alert(JSON.stringify(medias));
				//$scope.medias = medias;

			}
		};

		//audio upload
		$scope.uploadaudio = function (files) {
			//console.log('upload ready!!');
			if (files && files.length) {
				 
				   // alert(this.receiveuser);
				
				if(!$scope.user_id){

					if(! $scope.receiveuser && (! $scope.selectedUsers || $scope.selectedUsers.length === 0)) {
						alert('Please select the user first!');
						return;
					} else {
						var users = [];
						$scope.error = null;

						if ($scope.receiveuser) {
							$scope.user_id = $scope.receiveuser;
						} else {


							$scope.user_id = $scope.selectedUsers[0].id;
						}
					}

				}
			

				files.forEach(function(element, index, array){
					var file = element;
					//alert(JSON.stringify(element));
					Upload.upload({
						url: '/fileupload',
						fields: {'user_id': $scope.user_id, 'type': 4},
						file: file
					})
						.progress(function (evt) {
							var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
							//console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
						}).success(function (data, status, headers, config) {
							//alert((data).uri);
							//medias.push(data);
							//$scope.medias.push(data);
							//alert('file ' + config.file.name + 'uploaded. Response: ' + JSON.stringify(data));
							 
							var BaseUrl=$location.protocol()+'://'+location.host;
							var audiourl=BaseUrl+'/'+data.uri;
							$scope.link = audiourl;
							$scope.linkReadonly=true;
							return ;
						});
				});
				//alert(JSON.stringify(medias));
				//$scope.medias = medias;
			}
		};
		//----

		$scope.createMealAnswerInit = function(topicType){
			$scope.profiles = Profiles.query();
			//$scope.knowledgeList = Knowledge.query();
			// alert(topicType);
			TemplateTypes.query(function(types){
				var templateType;
				if($stateParams.mealId){
					var mealId = $stateParams.mealId;
					// alert();
					Meals.get({mealId : mealId},function(meal){
						// alert(JSON.stringify(meal));
						$scope.meal = meal;
						$scope.user_id = meal.userID.userID;
						templateType = 'meal';
						types.forEach(function(element, index, array){
							// alert(templateType+' '+element);
							if(templateType === element){
								var templates = TemplateTypes.getTemplateByType({typeId:index});
								$scope.topicTemplates = templates;
							}
						});
					});
				}
			});
		};

		$scope.createQuestionAnswerInit = function(topicType){
			$scope.profiles = Profiles.query();
			//$scope.knowledgeList = Knowledge.query();
			// alert(topicType);
			TemplateTypes.query(function(types){
				var templateType;
				if($stateParams.questionId){
					var questionId = $stateParams.questionId;
					Questions.get({questionId : questionId},function(q){
						$scope.question = q;
						$scope.user_id = q.userID.userID;
						templateType = q.questionType;
						types.forEach(function(element, index, array){
							// alert(templateType+' '+element);
							if(templateType === element){
								var templates = TemplateTypes.getTemplateByType({typeId:index});
								$scope.topicTemplates = templates;
							}
						});
					});
				}
			});
		};

		$scope.createReminderInit = function(){
			$scope.userList = [];
			Profiles.query(function(users) {
				users.forEach(function(user) {
					var name = '';
					if(user.firstName) {
						name += user.firstName + ' ';
					}
					if(user.lastName) {
						name += user.lastName;
					}
					$scope.userList.push({
						name:name + '(' + user.email + ')',
						id: user._id
					});
				});

			});

			TemplateTypes.query(function(types){
				var templateType;
				templateType = 'Tip';
				types.forEach(function(element, index, array){
					// alert(templateType+' '+element);
					if(templateType === element){
						var templates = TemplateTypes.getTemplateByType({typeId:index});
						$scope.topicTemplates = templates;
					}
				});
			});
		};

		$scope.createReminderWithUserIdInit = function(){
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

				$scope.displayName = '';
				if(profile.firstName) {
					$scope.displayName += profile.firstName + ' ';
				}
				if(profile.lastName) {
					$scope.displayName += profile.lastName;
				}

				setTimeout(function () {
					modalInstance.close({isInitialized: true});
				}, 500);

			});
			TemplateTypes.query(function(types){
				var templateType;
				templateType = 'Tip';
				types.forEach(function(element, index, array){
					// alert(templateType+' '+element);
					if(templateType === element){
						var templates = TemplateTypes.getTemplateByType({typeId:index});
						$scope.topicTemplates = templates;
					}
				});
			});
		};

		// $scope.updateTopicByKnowledge = function(){
		// 	var knowledgeId = $scope.knowledge;
		// 	Knowledge.get({knowledgeId:knowledgeId},function(k){
		// 		$scope.type = 'tip';
		// 		$scope.description = k.content;
		// 		$scope.medias = k.medias;
		// 		$scope.link = k.link;
		// 	});
		// };

		$scope.updateTopicByTemplate = function(id){
			// var templateId = $scope.template;
			var templateId = id;
			TopicTemplates.get({templateId:templateId},function(k){
				// alert(k);
				// $scope.type = 'tip';
				$scope.description = k.content;
				$scope.medias = k.medias;
				$scope.link = k.link;
			});
		};

		// Create new Topic
		$scope.create = function() {
			// Create new Topic object
			var topic = new Topics({
				send_push: $scope.checkpush.sendPush,
				send_email: $scope.checkpush.sendEmail,
				user: this.receiveuser,
				signature: this.signature,
				type: this.type,
				creator: Authentication.user.userID,
				description: this.description,
				medias: $scope.medias,
				link: this.link
			});


			// Redirect after save
			topic.$save(function(response) {
				$location.path('topics/' + response._id);

				// Clear form fields
				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});


		};

		// Create new Answer
		$scope.createQuestionAnswer = function() {
			// Create new Topic object
			var questionphoto;
			if(!$scope.medias){
				$scope.medias = [];
			}
			if($scope.question.medias[0]){
				questionphoto = $scope.question.medias[0].uri;
			}
			// var questionphoto = $scope.question.questionPhoto;
			if(questionphoto)
				$scope.medias.push({uri: questionphoto, mimeType:'image/jpg'});
			var topic = new QuestionAnswers({
				user: $scope.question.userID.userID,
				signature: this.signature,
				type: 'answer',
				creator: Authentication.user.userID,
				description: this.description,
				reference: $scope.question._id,
				medias: $scope.medias,
				link: this.link,
				referenceType: 'Question'
			});
			//alert(JSON.stringify(topic));

			// Redirect after save
			topic.$save(function(response) {
				$location.path('topics/' + response._id);

				// Clear form fields
				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});


		};

		// Create new Answer
		$scope.createMealAnswer = function() {
			// Create new Topic object
			if(!$scope.medias){
				$scope.medias = [];
			}
			var mealphoto = $scope.meal.mealPhoto;
			if(mealphoto)
				$scope.medias.push({uri: mealphoto, mimeType: 'image/jpg'});
			var topic = new MealAnswers({
				user: $scope.meal.userID.userID,
				signature: this.signature,
				type: 'answer',
				creator: Authentication.user.userID,
				description: this.description,
				reference: $scope.meal._id,
				medias: $scope.medias,
				link: this.link,
				referenceType: 'Meal'
			});
			//alert(JSON.stringify(topic));

			// Redirect after save
			topic.$save(function(response) {
				$location.path('topics/' + response._id);

				// Clear form fields
				$scope.title = '';
				$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});


		};

		// Create new Reminder
		$scope.createReminder = function() {

			if(! $scope.receiveuser && (! $scope.selectedUsers || $scope.selectedUsers.length === 0)) {
				$scope.error = 'recipient cannot be empty';
			} else {
				var users = [];
				$scope.error = null;

				if($scope.receiveuser) {
					users.push($scope.receiveuser);
				} else {
					$scope.selectedUsers.forEach(function (data) {
						users.push(data.id);
					});
				}

				var topic = new Reminders({
					send_push: $scope.checkpush.sendPush,
					send_email: $scope.checkpush.sendEmail,
					userList: users,
					//user: $scope.outputBrowsers[0]._id,
					signature: this.signature,
					type: 'reminder',
					creator: Authentication.user.userID,
					description: this.description,
					medias: $scope.medias,
					link: this.link
				});


				// Redirect after save
				topic.$save(function(response) {
					$location.path('topics/' + response._id);

					// Clear form fields
					$scope.title = '';
					$scope.content = '';
					$scope.selectedUsers = [];
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}





		};

		// Remove existing Topic
		//$scope.remove = function(topic) {
		//	if (topic) {
		//		topic.$remove();
        //
		//		for (var i in $scope.topics) {
		//			if ($scope.topics[i] === topic) {
		//				$scope.topics.splice(i, 1);
		//			}
		//		}
		//	} else {
		//		$scope.topic.$remove(function() {
		//			$location.path('topics');
		//		});
		//	}
		//};


		$scope.remove = function() {

			var url = 'topic';
			if($scope.topic.type === 'reminder') {
				url = 'reminders';
			} else if($scope.topic.type === 'answer') {
				url = 'answers';
			}

			$scope.topic.$remove(function() {
				$location.path(url);
			});
		};

		// Update existing Topic
		$scope.update = function() {
			var topic = $scope.topic;
			topic.medias = $scope.medias;

			topic.$update(function() {
				$location.path('topics/' + topic._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Topics
		$scope.find = function() {
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

			$http.get('/topics/count').then(function(count) {
				$scope.totalNumFixed = Number(count.data.count);
				$scope.totalNum = $scope.totalNumFixed;
				$scope.typeName = 'all';
				$scope.typeId = -1;
				//TopicTypes.query(function(types){
				//	var topicTypes = {};
				//	types.forEach(function(element, index, array){
				//		if(element !== 'tip'){
				//			var topics = TopicTypes.getTopicByType({typeId:index}, function(err){
				//				// if(!err){
				//				// 	templateTypes.push({type:element,templates:templates});
				//				// 	$scope.templateTypes = templateTypes;
				//				// }else{
				//				// 	alert(err);
				//				// }
				//			});
				//			topicTypes[element] = topics;
				//			//alert(JSON.stringify(topicTypes));
				//			$scope.topicTypes = topicTypes;
				//		}
				//	});
				//});

				Topics.query({numPerPage: $scope.numPerLargePage, currentPage: $scope.currentLargePage}, function (res) {
					$scope.allTopics = res;
					$scope.topics = $scope.allTopics.slice(0, $scope.numPerPage);
					setTimeout(function () {
						modalInstance.close({isInitialized: true});
					}, 500);
				});
			});
		};

		$scope.findByType = function(typeName) {
			var typeId = $scope.topicTypesEnum(typeName);
			$scope.typeId = typeId;
			$scope.typeName = typeName;
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
			$http.get('/topics/type/'+typeId+'/count').then(function(count) {
				$scope.totalNumFixed = Number(count.data.count);
				$scope.totalNum = $scope.totalNumFixed;
				TopicTypes.getTopicByType({typeId:typeId, numPerPage: $scope.numPerLargePage, currentPage: $scope.currentLargePage}, function(res) {
					$scope.allTopicTypes[typeName] = res;
					$scope.topicTypes[typeName] = $scope.allTopicTypes[typeName].slice(0, $scope.numPerPage);
					setTimeout(function () {
						modalInstance.close({isInitialized: true});
					}, 500);
				});
			});
		};


		// Find a list of Topics
		$scope.findByUserDeprecated = function() {
			console.log('topics.client.ctrl: findByUser is deprecated');
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
			TopicTypes.query(function(types){
				var topicTypes = {};
				types.forEach(function(element, index, array){
					if(element !== 'tip'){
						var topics = TopicTypesByUser.getTopicByTypeForOneUser({typeId:index,userId:$stateParams.userId}, function(err){
							// if(!err){
							// 	templateTypes.push({type:element,templates:templates});
							// 	$scope.templateTypes = templateTypes;
							// }else{
							// 	alert(err);
							// }
						});
						topicTypes[element] = topics;
						//alert(JSON.stringify(topicTypes));
						$scope.topicTypes = topicTypes;
					}
				});
				setTimeout(function() {
					modalInstance.close({ isInitialized: true});
				}, 500);
			});
			//$scope.topics = Topics.query();
			Topics.query({pageSize: $scope.numPerPage, page: $scope.currentPage}, function(res){
				$scope.topics = res;
			});
		};

		$scope.findByUser = function(typeName) {
			var typeId = $scope.topicTypesEnum(typeName);
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
			TopicTypesByUser.getTopicByTypeForOneUser({typeId:typeId,userId:$stateParams.userId}, function(res) {
				$scope.topicTypes[typeName] = res;
				//$scope.topics = $scope.allTopics.slice(0, $scope.numPerPage);
				setTimeout(function () {
					modalInstance.close({isInitialized: true});
				}, 500);
			});
		};

		// Find existing Topic
		$scope.findOne = function() {
			$scope.topic = Topics.get({
				topicId: $stateParams.topicId
			},function(topic){

				if(topic){
					// alert(JSON.stringify(topic.reference._id));
					$scope.question = topic.reference;
				}
				if(topic.medias === undefined && topic.medias.length === 0){
					topic.medias = undefined;
				}
			});

		};

		$scope.selectmedia = function(media){
			//alert(JSON.stringify(photo));
			$scope.premedia = media;
		};

		$scope.selectqmedia = function(media){
			//alert(JSON.stringify(photo));
			$scope.preqmedia = media;
		};

		// Create new Comment
		$scope.addComment = function(input_comment) {
			// Create new Comment object
			// alert(Authentication.user.userID);
			if(input_comment._id){
				new Comments({
					_id: input_comment._id,
					topic: $scope.topic._id,
					user: Authentication.user.userID,
					content: input_comment.content
				}).$update(function(response) {
						$scope.topic.comments.push({_id: response._id, user: Authentication.user, content: input_comment.content});

						//$scope.comment = null;
						$location.path('topics/'+ $scope.topic._id);
						// Clear form fields
						$scope.comment = new Comments();
						// $scope.comment.content = '';
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
					});
			}else{
				var comment = new Comments({
					topic: $scope.topic._id,
					user: Authentication.user.userID,
					content: input_comment.content
				});
				// alert(JSON.stringify(comment));


				// Redirect after save
				comment.$save(function(response) {
					$scope.topic.comments.push({_id: response._id, user: Authentication.user, content: input_comment.content});
					//alert(JSON.stringify(response));
					$location.path('topics/' + $scope.topic._id);
					// Clear form fields
					$scope.comment.content = '';
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}

		};

		// Remove existing Comment
		$scope.removeComment = function(comment) {
			if (comment) {
				new Comments({
					user : comment.user,
					_id : comment._id,
					content : comment.content,
					topic : $scope.topic._id
				}).$remove(function(response){
						for (var i in $scope.topic.comments) {
							if ($scope.topic.comments[i] === comment) {
								$scope.topic.comments.splice(i, 1);
							}
						}
					}, function(errorResponse) {
						$scope.error = errorResponse.data.message;
					});
				//comment.$remove();

			} else {

				$location.path('topics/'+ $scope.topic._id);

			}
		};

		// Update existing Comment
		$scope.updateComment = function(comment) {
			$scope.comment= comment;
			// $scope.comment._id = comment._id;
			// $scope.comment.content = comment.content;
			// $scope.comment.user = comment.user;
			for (var i in $scope.topic.comments) {
				if ($scope.topic.comments[i] === comment) {
					$scope.topic.comments.splice(i, 1);
				}
			}
			// comment.$update(function() {
			// 	$location.path('topics/' + comment._id);
			// }, function(errorResponse) {
			// 	$scope.error = errorResponse.data.message;
			// });
		};

		$scope.getComment = function(topicId) {
			var comment = $scope.comment;

			comment.$update(function() {
				$location.path('topics/' + comment._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

	}
]);
