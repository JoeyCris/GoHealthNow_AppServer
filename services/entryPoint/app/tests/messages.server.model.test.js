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

describe('Message CRUD tests', function() {
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
        description: "Message server",
        type: "message",
        create_time: Date.now,
        user: 	user.userID,
        creator: user.userID
      };
      done();
    });
  });

  it('should be able to create message if logged in', function(done) {
    agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
        // Handle signin error
        if (signinErr) done(signinErr);

        // Get the userId
        var userId = user.id;

        // Save a new message
        agent.post('/topics')
          .send(topic)
          .expect(200)
          .end(function(topicSaveErr, topicSaveRes) {
            // Handle message save error
            if (topicSaveErr) done(topicSaveErr);

            // Get a list of questions
            agent.get('/topics')
              .end(function(topicGetErr, topicGetRes) {
                // Handle message save error
                if (topicGetErr) done(topicGetErr);

                // Get message list
                var topicList = topicGetRes.body;

                // // Set assertions
                (topicList[0].description).should.equal('Message server');

                // Call the assertion callback
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
