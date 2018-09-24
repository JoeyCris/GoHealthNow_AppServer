'use strict';

// Meals controller
angular.module('meals').controller('MealsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Meals', 'Topics', 'FoodItems', 'MealTypes', 'Upload',
	function($scope, $stateParams, $location, Authentication, Meals , Topics, FoodItems, MealTypes, Upload) {
		$scope.authentication = Authentication;
		$scope.types = MealTypes.query();
		$scope.selectedType = 'Snack';

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

		$scope.createInit = function(){
			// alert(111);
			$scope.foodItems = FoodItems.query();
			$scope.meal = new Meals();
			$scope.meal.food=[];
			// FoodItems.query(function(items){
			// 	//alert(JSON.stringify(items));
			// 	//$scope.foodItems ＝ items;
			// });

			//$scope.knowledgeList = Knowledge.query();
			// alert(topicType);
			// TemplateTypes.query(function(types){
			// 	var templateType;
			// 	if($stateParams.questionId){
			// 		var questionId = $stateParams.questionId;
			// 		Questions.get({questionId : questionId},function(q){
			// 			$scope.question = q;
			// 			$scope.user_id = q.userID.userID;
			// 			templateType = q.questionType;
			// 			types.forEach(function(element, index, array){
			// 				// alert(templateType+' '+element);
			// 				if(templateType === element){
			// 					var templates = TemplateTypes.getTemplateByType({typeId:index});
			// 					$scope.topicTemplates = templates;
			// 				}
			// 			});
			// 		});
			// 	}
			// });
		};

		$scope.addFood = function(meal){
			var food = {
				itemID: this.food.foodItem,
        servingSize: this.food.servingSize,
        servingSizeName: this.food.servingSizeName.name,
				servingSizeConv: this.food.servingSizeName.convFac
			};
			meal.food.push(food);
			//alert(JSON.stringify($scope.meal.food));
			this.food = {};
		};

		// Remove existing Food
		$scope.removeFood = function(food) {
			if (food) {
				for (var i in $scope.meal.food) {
					if ($scope.meal.food[i] === food) {
						$scope.meal.food.splice(i, 1);
					}
				}
			}
		};

		// Create new Meal
		$scope.create = function() {
			// Create new Meal object
			var meal = $scope.meal;
			meal.userID = Authentication.user.userID;
			meal.mealType = this.type;
			if($scope.medias && $scope.medias.length > 0){
				alert($scope.medias[0].uri);
				meal.mealPhoto = $scope.medias[0].uri;
				var mealPhotoNameIndex = meal.mealPhoto.lastIndexOf('/');
				if(mealPhotoNameIndex !== -1)
					meal.mealPhoto = meal.mealPhoto.substring(mealPhotoNameIndex+1);
			}
			meal.carb = 0;
			meal.pro = 0;
			meal.fat = 0;
			meal.cals = 0;
			meal.food.forEach(function(element,index,array){
				var food = element.itemID;
				var servingSize = element.servingSize;
				var servingSizeConv = element.servingSizeConv;
				meal.carb += food.carbs * servingSize * servingSizeConv;
				meal.pro += food.protein * servingSize * servingSizeConv;
				meal.fat += food.fat * servingSize * servingSizeConv;
				meal.cals += food.calories * servingSize * servingSizeConv;
				meal.food[index].itemID = meal.food[index].itemID._id;
			});
			// meal.itemID = meal.food.itemID._id;

			// Redirect after save
			meal.$save(function(response) {
				$location.path('meals/' + response._id);

				// Clear form fields
				$scope.type = '';
				//$scope.content = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Meal
		$scope.remove = function(meal) {
			if (meal) {
				meal.$remove();

				for (var i in $scope.meals) {
					if ($scope.meals[i] === meal) {
						$scope.meals.splice(i, 1);
					}
				}
			} else {
				$scope.meal.$remove(function() {
					$location.path('meals');
				});
			}
		};

		// Update existing Meal
		$scope.update = function() {
			var meal = $scope.meal;
			if($scope.medias && $scope.medias.length > 0){
				// alert($scope.medias);
				meal.mealPhoto = $scope.medias[0].uri;
				var mealPhotoNameIndex = meal.mealPhoto.lastIndexOf('/');
				if(mealPhotoNameIndex !== -1)
					meal.mealPhoto = meal.mealPhoto.substring(mealPhotoNameIndex+1);
			}

			meal.$update(function() {
				$location.path('meals/' + meal._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Meals
		$scope.find = function() {
			MealTypes.query(function(types){
				var mealTypes = [];
				types.forEach(function(element, index, array){
					mealTypes.push({type:element,meals:MealTypes.getMealByType({typeId:index})});
					$scope.mealTypes = mealTypes;
				});
			});
			$scope.meals = Meals.query();
		};

		// Find existing Meal
		$scope.findOne = function(topic) {
			//$scope.foodItems = FoodItems.query();
			$scope.meal = Meals.get({
				mealId: $stateParams.mealId
			},function(meal){
				$scope.medias = meal.medias;
			});

		};

	}
]);
