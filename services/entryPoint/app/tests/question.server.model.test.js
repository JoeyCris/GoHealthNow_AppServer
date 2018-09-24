'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Question = mongoose.model('Question'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials,
      user,
      question;

var err = new Error();

describe('Question CRUD tests', function() {
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
			question ={
        questionContent: "test",
        questionType: "Others",
        userID: 	user.userID
      };
			done();
		});
	});

  // it('should be able to create  question if logged in', function(done) {
  //   agent.post('/auth/signin')
  //     .send(credentials)
  //     .expect(200)
  //     .end(function(signinErr, signinRes) {
  //       // Handle signin error
  //       if (signinErr) done(signinErr);
	//
  //       // Get the userId
  //       var userId = user.id;
  //       console.log(question);
  //       // Save a new question
  //       agent.post('/questions')
  //         .send(question)
  //         .expect(200)
  //         .end(function(questionSaveErr, questionSaveRes) {
  //           // Handle question save error
  //           if (questionSaveErr) done(questionSaveErr);
	//
  //           // Get a list of questions
  //           agent.get('/questions')
  //             .end(function(questionsGetErr, questionsGetRes) {
  //               // Handle question save error
  //               if (questionsGetErr) done(questionsGetErr);
	//
  //               // Get questions list
  //               var questionList = questionsGetRes.body;
	//
  //               // Set assertions
  //               // (questionList[0].userID._id).should.equal(userId);
  //               done();
  //             });
  //         });
  //     });
  // });

	it('should be able to list question based on questionID', function(done) {

		agent.post('/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signinErr, signinRes) {
				if(signinErr) done(signinErr);

				// Get the userId
        var userId = user.id;
        // Save a new question
        agent.post('/questions')
          .send(question)
          .expect(200)
          .end(function(questionSaveErr, questionSaveRes) {
						if(questionSaveErr) done(questionSaveErr);

						var questionid = questionSaveRes.body._id;
						agent.get('/questions/'+questionid)
							.expect(200)
							.end(function(questionListErr, questionListRes) {
								if(questionListErr) done(questionListErr);
								var questionType = questionListRes.body.questionType;
								var questionContent = questionListRes.body.questionContent;

								questionType.should.equal('Others');
								questionContent.should.equal('test');
								done();
							});
					});
			});
	});

	it('should be able to update question based on questionID', function(done) {

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				if(signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;
				// Save a new question
				agent.post('/questions')
					.send(question)
					.expect(200)
					.end(function(questionSaveErr, questionSaveRes) {
						if(questionSaveErr) done(questionSaveErr);

						var questionid = questionSaveRes.body._id;
						question.questionContent = "content updated";
						agent.put('/questions/'+questionid)
					  	.send(question)
							.expect(200)
							.end(function(questionListErr, questionListRes) {
								if(questionListErr) done(questionListErr);
								var questionType = questionListRes.body.questionType;
								var questionContent = questionListRes.body.questionContent;

								questionType.should.equal('Others');
								questionContent.should.equal('content updated');
								done();
							});
					});
			});
	 });

	 it('should be able to delete question based on questionID', function(done) {

 		agent.post('/auth/signin')
 			.send(credentials)
 			.expect(200)
 			.end(function(signinErr, signinRes) {
 				if(signinErr) done(signinErr);

 				// Get the userId
 				var userId = user.id;
 				// Save a new question
 				agent.post('/questions')
 					.send(question)
 					.expect(200)
 					.end(function(questionSaveErr, questionSaveRes) {
 						if(questionSaveErr) done(questionSaveErr);

 						var questionid = questionSaveRes.body._id;
 						agent.delete('/questions/'+questionid)
 							.expect(200)
							done();

 					});
 			});
 	 });

  after(function(done) {
		User.remove().exec(function() {
			Question.remove().exec(done);
		});
	});

});
