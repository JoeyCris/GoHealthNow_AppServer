'use strict';

// Knowledge controller
angular.module('knowledge').controller('KnowledgeController', ['$scope', '$stateParams', '$location', 'Authentication', 'Knowledge', 'Topics', 'Profiles', 'KnowledgeTypes', 'Upload','ConditionFunctions',
	function($scope, $stateParams, $location, Authentication, Knowledge , Topics, Profiles, KnowledgeTypes, Upload, ConditionFunctions) {
		$scope.authentication = Authentication;
		$scope.types = KnowledgeTypes.query();
		$scope.selectedType = 'tip';
		$scope.replaceParts = [{keyword:'',reference:''}];
		$scope.priority = 3;
		$scope.language = 'en';
		$scope.switchLanguage = function(){
			if($scope.language === 'en'){
				$scope.language = 'fr';
			}else{
				$scope.language = 'en';
			}
		};
		$scope.isFrench = function(){
			return $scope.language === 'fr';
		};
		$scope.isEnglish = function(){
			return $scope.language === 'en';
		};
		$scope.$watchCollection('replaceParts[replaceParts.length-1]',function(newValue, oldValue, scope){
			if(!newValue){
				$scope.addReplacePart({keyword:'',reference:''});
			}else if(newValue.keyword.trim() === '' && newValue.reference.trim() === ''){
				var x = 1;
			}else{
				$scope.addReplacePart({keyword:'',reference:''});
			}
		});

		$scope.addReplacePart = function(ele){
			$scope.replaceParts.push(ele);
		};
		$scope.removeReplacePart = function(ele){
			var index = $scope.replaceParts.indexOf(ele);
			// console.log(index);
			$scope.replaceParts.splice(index, 1);
		};
		$scope.hoveringOver = function(value) {
	    $scope.overStar = value;
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
				}

    });

		$scope.selectmedia = function(media){
			$scope.premedia = media;
		};

		$scope.upload = function (files) {
        if (files && files.length) {
						var medias = [];
						files.forEach(function(element, index, array){
							var file = element;
							Upload.upload({
									url: '/fileupload',
									fields: {'user_id': Authentication.user.userID, 'type': 0},
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

		$scope.createinit = function(){
			if(!$scope.checkconditions){
				var conditions = $scope.conditions = ConditionFunctions.query(function(){
					conditions.forEach(function(element, index, array){
						element.ticked = false;
					});
					$scope.checkconditions = conditions;
				});
			}

			if($stateParams.typeId){
				var typeId = $stateParams.typeId;

				//alert(typeId);
				$scope.type = typeId;
			}


			$scope.checkpush = { sendPush : true, sendEmail : false };
		  $scope.checkResults = [];

		  $scope.$watchCollection('checkpush', function () {
		    $scope.checkResults = [];
		    angular.forEach($scope.checkpush, function (value, key) {
		      if (value) {
		        $scope.checkResults.push(key);
		      }
		    });
		  });
		};

		// Create new Knowledge
		$scope.create = function() {
			// Create new Knowledge object
			var replace_parts = [];
			$scope.replaceParts.forEach(function(ele){
				if(ele.keyword.trim()===''&&ele.reference.trim()===''){
					var x = 1;
				}else{
					replace_parts.push(ele);
				}
			});
			var knowledge = new Knowledge({
				send_push: $scope.checkpush.sendPush,
				send_email: $scope.checkpush.sendEmail,
				title: this.title,
				type: this.type,
				content: this.content,
				link: this.link,
				medias: $scope.medias,
				conditions: $scope.checkConditions,
				replace_parts: replace_parts,
				priority: $scope.priority
			});

			// alert(JSON.stringify(knowledge));
			// Redirect after save
			knowledge.$save(function(response) {
				$location.path('knowledge/' + response._id);

				// Clear form fields
				$scope.type = '';
				$scope.content = '';
				$scope.title = '';
				$scope.link = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Knowledge
		$scope.remove = function(knowledge) {
			if (knowledge) {
				knowledge.$remove();

				for (var i in $scope.knowledgeList) {
					if ($scope.knowledgeList[i] === knowledge) {
						$scope.knowledgeList.splice(i, 1);
					}
				}
			} else {
				$scope.knowledge.$remove(function() {
					$location.path('knowledge');
				});
			}
		};

		$scope.updateinit = function(){
			$scope.checkResults = [];
		  $scope.$watchCollection('checkpush', function () {
		    $scope.checkResults = [];
		    angular.forEach($scope.checkpush, function (value, key) {
		      if (value) {
		        $scope.checkResults.push(key);
		      }
		    });
		  });

			$scope.knowledge = Knowledge.get({
				knowledgeId: $stateParams.knowledgeId
			},function(knowledge){
				// console.log(knowledge);
				$scope.checkpush = { sendPush : knowledge.send_push, sendEmail : knowledge.send_email };
				$scope.medias = knowledge.medias;
				$scope.priority = knowledge.priority;
				if(knowledge.replace_parts)
					$scope.replaceParts = knowledge.replace_parts;
				if(!$scope.checkconditions){

					var conditions = $scope.conditions = ConditionFunctions.query(function(){
						conditions.forEach(function(element, index, array){
							element.ticked = false;
							if(knowledge.conditions){
								knowledge.conditions.forEach(function(ele){
									// console.log(ele._id,element._id);
									if(element._id === ele._id){
										element.ticked = true;
									}
								});
							}
						});
						$scope.checkconditions = conditions;
					});
				}

				// console.log(knowledge.conditions);
			});

			// $scope.checkpush = { sendPush : true, sendEmail : true };

		};

		// Update existing Knowledge
		$scope.update = function() {
			var knowledge = $scope.knowledge;
			var replace_parts = [];
			$scope.replaceParts.forEach(function(ele){
				if(ele.keyword.trim()===''&&ele.reference.trim()===''){
					var x = 1;
				}else{
					replace_parts.push(ele);
				}
			});
			knowledge.medias = $scope.medias;
			knowledge.send_push = $scope.checkpush.sendPush;
			knowledge.send_email = $scope.checkpush.sendEmail;
			knowledge.replace_parts = replace_parts;
			knowledge.conditions = $scope.checkConditions;
			knowledge.priority = $scope.priority;
			knowledge.$update(function() {
				$location.path('knowledge/' + knowledge._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Knowledge
		$scope.find = function() {
			KnowledgeTypes.query(function(types){
				var knowledgeTypes = [];
				types.forEach(function(element, index, array){
					knowledgeTypes.push({type:element,knowledgeList:KnowledgeTypes.getKnowledgeByType({typeId:index})});
					$scope.knowledgeTypes = knowledgeTypes;
				});
			});
			$scope.knowledgeList = Knowledge.query();
		};

		// Find existing Knowledge
		$scope.findOne = function(knowledge) {
			$scope.knowledge = Knowledge.get({
				knowledgeId: $stateParams.knowledgeId
			},function(knowledge){
				// console.log(knowledge);
				$scope.medias = knowledge.medias;
			});

		};

	}
]);
