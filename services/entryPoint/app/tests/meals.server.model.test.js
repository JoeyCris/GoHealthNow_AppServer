'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Meal = mongoose.model('Meal'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials,
      user,
      meal;

var err = new Error();

describe('Meals CRUD tests', function() {

  // Before test
  before(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			userName: credentials.username,
			password: credentials.password,
			provider: 'local'
		});
		user.userID = user._id.toString();
		// Save an user to the test db and create new meal record
		user.save(function(err) {
			if(err) {
				console.log(err);
			}
			meal ={
        mealType: "Snack",
        carb: 13,
        pro: 9,
        fat: 5,
        cals: 524,
        userID: user.userID
      };
			done();
		});
	});

  it('should be able to create  meal record if logged in', function(done) {
    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new meal
        agent.post('/meals')
          .send(meal)
          .expect(200)
          .end(function(mealSaveErr, mealSaveRes) {
            // Handle meal save error
            if (mealSaveErr) done(mealSaveErr);

            // Get a list of meal
            agent.get('/meals')
              .end(function(mealsGetErr, mealsGetRes) {
                // Handle meal save error
                if (mealsGetErr) done(mealsGetErr);
                // Get meals list
                var mealList = mealsGetRes.body;
                (mealList[0].userID._id).should.equal(userId);
                // Call the assertion callback
                done();
              });
          });

      });
  });

  it('should be able to list meal based on mealID', function(done) {

    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new meal
        agent.post('/meals')
          .send(meal)
          .expect(200)
          .end(function(mealSaveErr, mealSaveRes) {
            // Handle meal save error
            if (mealSaveErr) done(mealSaveErr);

            var mealID = mealSaveRes.body._id;

            // Get a meal based on mealID
            agent.get('/meals/'+mealID)
              .end(function(mealGetErr, mealGetRes) {
                // Handle meal response error
                if (mealGetErr) done(mealGetErr);
                //  Filter the response from the body
                var mealResponse = mealGetRes.body;
                // Get the Id for validation
                mealResponse._id.should.equal(mealID);
                // Call the assertion callback
                done();
              });
          });
      });

  });

  it('should be able to delete meal based on mealID', function(done) {

    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new meal
        agent.post('/meals')
          .send(meal)
          .expect(200)
          .end(function(mealSaveErr, mealSaveRes) {
            // Handle meal save error
            if (mealSaveErr) done(mealSaveErr);

            var mealID = mealSaveRes.body._id;

            // Get a list of meal
            agent.delete('/meals/'+mealID)
              .expect(200)
              done();

          });
      });

  });

  it('should be able to update meal based on mealID', function(done) {

    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new meal
        agent.post('/meals')
          .send(meal)
          .expect(200)
          .end(function(mealSaveErr, mealSaveRes) {
            // Handle meal save error
            if (mealSaveErr) done(mealSaveErr);

            var mealID = mealSaveRes.body._id;
            meal.cals = 550

            agent.put('/meals/'+mealID)
            .send(meal)
            .expect(200)
              .end(function(mealGetErr, mealGetRes) {
                // Handle meal save error
                if (mealGetErr) done(mealGetErr);

                var mealResponse = mealGetRes.body;
                var cals = mealResponse.cals;
                cals.should.equal(550);

                // Call the assertion callback
                done();
              });
          });
      });

  });

  // After test
  after(function(done) {
    User.remove().exec(function() {
      Meal.remove().exec(done);
    });
  });


});
