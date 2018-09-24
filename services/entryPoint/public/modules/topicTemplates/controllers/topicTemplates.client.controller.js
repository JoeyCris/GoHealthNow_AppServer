'use strict';

// Topic Template controller
angular.module('topicTemplates').controller('TopicTemplatesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Templates', 'Topics', 'Profiles', 'TemplateTypes', 'Upload',
	function($scope, $stateParams, $location, Authentication, Templates , Topics, Profiles, TemplateTypes, Upload) {
		$scope.authentication = Authentication;
		$scope.types = TemplateTypes.query();
		$scope.selectedType = 'Tip';

		$scope.templateTypes = {
			'Tip': {type: 'Tip', name: 'Personalized Tip', description: 'This is the template for Personalized Tips. It will only show up when you create an Personalized Tip', templates:[]},
			'Diet': {type: 'Diet', name: 'Diet Question', description: 'This is the template for Answers about \"Diet\" questions. It will only show up when you create an answer for question of type \"Diet\"', templates:[]},
			'Exercise': {type: 'Exercise', name: 'Exercise Question', description: 'This is the template for Answers about \"Exercise\" questions. It will only show up when you create an answer for question of type \"Exercise\"', templates:[]},
			'BloodGlucose': {type: 'BloodGlucose', name: 'BloodGlucose Question', description: 'This is the template for Answers about \"Blood Glucose\" questions. It will only show up when you create an answer for question of type \"BloodGlucose\"', templates:[]},
			'Weight': {type: 'Weight', name: 'Weight Question', description: 'This is the template for Answers about \"Weight\" questions. It will only show up when you create an answer for question of type \"Weight\"', templates:[]},
			'Others': {type: 'Others', name: 'Others Question', description: 'This is the template for Answers about \"Others\" questions. It will only show up when you create an answer for question of type \"Others\"', templates:[]},
			// 'meal': {type: 'meal', name: 'Meal Record', description: 'Template for Answers about Meal Records. It will only show up when you create an answer for Meal Record', templates:[]}
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
			if($stateParams.typeId){
				var typeId = $stateParams.typeId;
				//alert(typeId);
				$scope.type = typeId;
			}
		};

		// Create new Template
		$scope.create = function() {
			// Create new Template object
			var template = new Templates({
				creator: Authentication.user.userID,
				title: this.title,
				type: this.type,
				content: this.content,
				link: this.link,
				medias: $scope.medias
			});

			// Redirect after save
			template.$save(function(response) {
				$location.path('templates/' + response._id);

				// Clear form fields
				$scope.type = '';
				$scope.content = '';
				$scope.title = '';
				$scope.link = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Template
		$scope.remove = function(template) {
			if (template) {
				template.$remove();

				for (var i in $scope.templates) {
					if ($scope.templates[i] === template) {
						$scope.templates.splice(i, 1);
					}
				}
			} else {
				$scope.template.$remove(function() {
					$location.path('templates');
				});
			}
		};

		// Update existing Template
		$scope.update = function() {
			var template = $scope.template;
			template.medias = $scope.medias;

			template.$update(function() {
				$location.path('templates/' + template._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Templates
		$scope.find = function() {
			TemplateTypes.query(function(types){
				var templateTypes = [];
				types.forEach(function(element, index, array){
					var templates = TemplateTypes.getTemplateByType({typeId:index}, function(err){
						// if(!err){
						// 	templateTypes.push({type:element,templates:templates});
						// 	$scope.templateTypes = templateTypes;
						// }else{
						// 	alert(err);
						// }
					});
					$scope.templateTypes[element].templates = templates;
					// templateTypes.push({type:element,templates:templates});
					// $scope.templateTypes = templateTypes;
				});
			});
			$scope.templates = Templates.query();
		};

		// Find existing Template
		$scope.findOne = function(template) {
			$scope.template = Templates.get({
				templateId: $stateParams.templateId
			},function(template){
				$scope.medias = template.medias;
			});

		};

	}
]);
