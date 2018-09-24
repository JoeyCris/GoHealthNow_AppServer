'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
  agent = request.agent(app),
	User = mongoose.model('User');

var user, userID;

describe('Model unit test', function() {
	before(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			userName: 'username',
			password: 'password',
			provider: 'local'
		});
		user.userID = user._id.toString();
    userID = user.userID;
		done();
	});

	describe('Profile', function() {

		it('Create profile', function(done) {
			user.save(done);
		});

    it("List all the profiles", function(done){
      agent.get('/profiles')
       .expect(200)
       done();
       });

    });

    it("List profile based on userID", function(done){
      agent.get('/profiles/'+userID)
       .expect(200)
       done();
       });

	after(function(done) {
		User.remove().exec(done);
	});
});
