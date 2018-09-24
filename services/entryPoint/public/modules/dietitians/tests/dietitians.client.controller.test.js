'use strict';

(function() {
	// Dietitians Controller Spec
	describe('Dietitians Controller Tests', function() {
		// Initialize global variables
		var DietitiansController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Dietitians controller.
			DietitiansController = $controller('DietitiansController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Dietitian object fetched from XHR', inject(function(Dietitians) {
			// Create sample Dietitian using the Dietitians service
			var sampleDietitian = new Dietitians({
				name: 'New Dietitian'
			});

			// Create a sample Dietitians array that includes the new Dietitian
			var sampleDietitians = [sampleDietitian];

			// Set GET response
			$httpBackend.expectGET('dietitians').respond(sampleDietitians);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.dietitians).toEqualData(sampleDietitians);
		}));

		it('$scope.findOne() should create an array with one Dietitian object fetched from XHR using a dietitianId URL parameter', inject(function(Dietitians) {
			// Define a sample Dietitian object
			var sampleDietitian = new Dietitians({
				name: 'New Dietitian'
			});

			// Set the URL parameter
			$stateParams.dietitianId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/dietitians\/([0-9a-fA-F]{24})$/).respond(sampleDietitian);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.dietitian).toEqualData(sampleDietitian);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Dietitians) {
			// Create a sample Dietitian object
			var sampleDietitianPostData = new Dietitians({
				name: 'New Dietitian'
			});

			// Create a sample Dietitian response
			var sampleDietitianResponse = new Dietitians({
				_id: '525cf20451979dea2c000001',
				name: 'New Dietitian'
			});

			// Fixture mock form input values
			scope.name = 'New Dietitian';

			// Set POST response
			$httpBackend.expectPOST('dietitians', sampleDietitianPostData).respond(sampleDietitianResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Dietitian was created
			expect($location.path()).toBe('/dietitians/' + sampleDietitianResponse._id);
		}));

		it('$scope.update() should update a valid Dietitian', inject(function(Dietitians) {
			// Define a sample Dietitian put data
			var sampleDietitianPutData = new Dietitians({
				_id: '525cf20451979dea2c000001',
				name: 'New Dietitian'
			});

			// Mock Dietitian in scope
			scope.dietitian = sampleDietitianPutData;

			// Set PUT response
			$httpBackend.expectPUT(/dietitians\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/dietitians/' + sampleDietitianPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid dietitianId and remove the Dietitian from the scope', inject(function(Dietitians) {
			// Create new Dietitian object
			var sampleDietitian = new Dietitians({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Dietitians array and include the Dietitian
			scope.dietitians = [sampleDietitian];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/dietitians\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleDietitian);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.dietitians.length).toBe(0);
		}));
	});
}());