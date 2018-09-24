'use strict';

var should = require('should'),
  	request = require('supertest'),
  	app = require('../../server'),
  	mongoose = require('mongoose'),
  	User = mongoose.model('User'),
  	Topic = mongoose.model('Topic'),
  	agent = request.agent(app);

/**
 * Globals
 */
var credentials,
    user,
    topic;

var err = new Error();

describe('Topic CRUD tests', function() {
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
		// Save a user to the test db and create new question
		user.save(function(err) {
			if(err) {
				console.log(err);
			}
			topic = {
        description: "test topic",
        type: "message",
        create_time: Date.now,
        user: 	user.userID,
        creator: user.userID
      };
			done();
		});
	});

  it('should be able to create topic if logged in', function(done) {
    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new question
        agent.post('/topics')
          .send(topic)
          .expect(200)
          .end(function(topicSaveErr, topicSaveRes) {
            // Handle question save error
            if (topicSaveErr) done(topicSaveErr);

            // Get a list of questions
            agent.get('/topics')
              .end(function(topicGetErr, topicGetRes) {
                // Handle question save error
                if (topicGetErr) done(topicGetErr);

                // Get questions list
                var topicList = topicGetRes.body;

                // // Set assertions
                (topicList[0].description).should.equal('test topic');
                (topicList[0].type).should.equal('message');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  	it('should be able to list topic based on topicID', function(done) {

      agent.post('/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function(signinErr, signinRes) {
          // Handle signin error
          if (signinErr) done(signinErr);

          // Get the userId
          var userId = user.id;

          // Save a new question
          agent.post('/topics')
            .send(topic)
            .expect(200)
            .end(function(topicSaveErr, topicSaveRes) {
              // Handle question save error
              if (topicSaveErr) done(topicSaveErr);

              var topicID = topicSaveRes.body._id;

              // Get a list of questions
              agent.get('/topics/'+topicID)
                .end(function(topicGetErr, topicGetRes) {
                  // Handle question save error
                  if (topicGetErr) done(topicGetErr);

                  var topicResponse = topicGetRes.body;
                  var description = topicResponse.description;
                  var type = topicResponse.type;

                  description.should.equal("test topic");
                  type.should.equal("message");

                  // Call the assertion callback
                  done();
                });
            });
        });

    });

    it('should be able to update topic based on topicID', function(done) {

      agent.post('/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function(signinErr, signinRes) {
          // Handle signin error
          if (signinErr) done(signinErr);

          // Get the userId
          var userId = user.id;

          // Save a new question
          agent.post('/topics')
            .send(topic)
            .expect(200)
            .end(function(topicSaveErr, topicSaveRes) {
              // Handle question save error
              if (topicSaveErr) done(topicSaveErr);

              var topicID = topicSaveRes.body._id;
              topic.description = "test topic updated";

              // Get a list of questions
              agent.put('/topics/'+topicID)
              .send(topic)
              .expect(200)
                .end(function(topicGetErr, topicGetRes) {
                  // Handle question save error
                  if (topicGetErr) done(topicGetErr);

                  var topicResponse = topicGetRes.body;
                  var description = topicResponse.description;
                  var type = topicResponse.type;

                  description.should.equal("test topic updated");
                  type.should.equal("message");

                  // Call the assertion callback
                  done();
                });
            });
        });

    });

    it('should be able to delete topic based on topicID', function(done) {

      agent.post('/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function(signinErr, signinRes) {
          // Handle signin error
          if (signinErr) done(signinErr);

          // Get the userId
          var userId = user.id;

          // Save a new question
          agent.post('/topics')
            .send(topic)
            .expect(200)
            .end(function(topicSaveErr, topicSaveRes) {
              // Handle question save error
              if (topicSaveErr) done(topicSaveErr);

              var topicID = topicSaveRes.body._id;

              // Get a list of questions
              agent.delete('/topics/'+topicID)
                .expect(200)
                done();

            });
        });

    });

    it('should be able to list topic based on userID', function(done) {

      agent.post('/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function(signinErr, signinRes) {
          // Handle signin error
          if (signinErr) done(signinErr);

          // Get the userId
          var userId = user.id;

          // Save a new topic
          agent.post('/topics')
            .send(topic)
            .end(function(topicSaveErr, topicSaveRes) {
              // Handle topic save error
              if (topicSaveErr) done(topicSaveErr);

              var userID = topicSaveRes.body.user;

              //Get a list of topics based on user ID
              agent.get('/topics/user/'+userID)
                .expect(200)
                .end(function(userGetErr, userGetRes){
                  if (userGetErr) done(userGetErr);

                  var arrayLength = userGetRes.body.length;
                  arrayLength.should.equal(5);
                  done();

                });
            });
        });
    });

    it('should be able to delete topic based on topicID', function(done) {

      agent.post('/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function(signinErr, signinRes) {
          // Handle signin error
          if (signinErr) done(signinErr);

          // Get the userId
          var userId = user.id;

          // Save a new topic
          agent.post('/topics')
            .send(topic)
            .expect(200)
            .end(function(topicSaveErr, topicSaveRes) {
              // Handle topic save error
              if (topicSaveErr) done(topicSaveErr);

              var topicID = topicSaveRes.body._id;

              // delete a specific topic
              agent.delete('/topics/'+topicID)
                .expect(200)
                done();

            });
        });

    });

    it('should be able to list topic type', function(done) {

      agent.post('/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function(signinErr, signinRes) {
          // Handle signin error
          if (signinErr) done(signinErr);

          // Get the userId
          var userId = user.id;

          // Save a new topic
          agent.post('/topics')
            .send(topic)
            .end(function(topicSaveErr, topicSaveRes) {
              // Handle topic save error
              if (topicSaveErr) done(topicSaveErr);

              //Get a list topics type
              agent.get('/topics/type')
                .expect(200)
                .end(function(typeGetErr, typeGetRes){
                  if (typeGetErr) done(typeGetErr);

                  var types = typeGetRes.body.toString();
                  types.should.equal(['message', 'tip', 'answer', 'reminder', 'announcement'].toString());
                  done();

                });
            });
        });
  });

  after(function(done) {
		User.remove().exec(function() {
			Topic.remove().exec(done);
		});
	});

});
