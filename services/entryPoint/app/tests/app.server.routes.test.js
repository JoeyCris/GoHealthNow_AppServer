'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Meal = mongoose.model('Meal'),
	parseString = require('xml2js').parseString,
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, user2, registerInfo;
var err = new Error();

function run_cmd(cmd, args, cb, end) {
	var spawn = require('child_process').spawn,
		child = spawn(cmd, args),
		me = this;
	child.stdout.on('data', function (buffer) { cb(me, buffer) });
	child.stdout.on('end', end);
}
/**
 * Article routes tests
 */
describe('App server communication tests', function() {
	beforeEach(function(done) {
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
		// Save a user to the test db and create new article
		user.save(function(err) {
			if(err) {
				console.log(err);
				return done(err);
			}
			//done();
		});

		// Create a new user
		user2 = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'glucoguide',
			userName: 'glucoguide',
			password: 'glucoguide',
			provider: 'local'
		});
		user2.userID = user2._id.toString();
		// Save a user to the test db and create new article
		user2.save(function(err) {
			if(err) {
				console.log(err);
				return done(err);
			}
			done();
		});

		registerInfo ={ 'LoginInfo': '<LoginInfo>\ ' +
		'<LoginType >0</LoginType>\ ' +
		'<UserID >0</UserID>\ ' +
		'<Email >notExistUser@test.com</Email>\ ' +
		'<Password >password</Password>\ ' +
		'<RegistrationID>1111</RegistrationID>\ ' +
		'<DeviceType>1</DeviceType>\ ' +
		'</LoginInfo>' };
	});

	it('should be able to register a new user', function(done) {

		agent.post('/GlucoGuide/verifyaction')
			.send(registerInfo)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				//console.log(signinRes.text);
				parseString(signinRes.text, function(err, data){
					if (!data || !data.Profile || !data.Profile.UserID) {
						done(new Error("Register respond not correct"));
					}
					else {
						done();
					}
				});
			});
	});

	//TODO: test cases for login:
	/*
	 <LoginInfo >
	 <LoginType >0</LoginType>
	 <UserID >0</UserID>
	 <Email >hdjdj@hxjshdj</Email>
	 <Password >hxjxjdjx</Password>
	 <RegistrationID></RegistrationID>
	 <DeviceType>1</DeviceType> //0: Android, 1: iOS
	 </LoginInfo>
	 */
	// 1. normal login
	// 2. wrong password
	// 3. wrong username
	// 4.

	// TODO

	it('should fail to register an existing user again', function(done) {
		agent.post('/GlucoGuide/verifyaction')
			.send(registerInfo)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				parseString(signinRes.text, function(err, data){
					if (!data || !data.Profile || !data.Profile.UserID) {
						done(new Error("Register respond not correct"));
					}

					agent.post('/GlucoGuide/verifyaction')
						.send(registerInfo)
						.expect(400)
						.end(function(signinErr, signinRes) {
							(signinRes.text).should.match('Account already exists');
							//console.log(signinRes.text);
							done();
						});
				});
			});
	});

	// Test update user profile.
	it('it should update user profile', function(done) {
		var profile ={Profile: '<Profile> '+
									'<UserID>' + user.userID + '</UserID>'+
									'<Height>190</Height>'+
									'<Gender>1</Gender>'+
									'<DOB>1973</DOB>'+
									'<WaistSize>80</WaistSize>'+
									'<LastName>aa</LastName>'+
									'<FirstName>bb</FirstName>'+
									'<OrganizationCode>edu401a</OrganizationCode>'+
									'<BMI>21.32964</BMI> '+
									'<Points></Points>'+
									'<PromoteMessage></PromoteMessage>'+
									'<updatedTime>2015-03-19T16:27:59-0400</updatedTime>'+
									'<RegistrationTime>2015-03-19T16:27:59-0400</RegistrationTime>'+
								'</Profile>'};

		agent.post('/GlucoGuide/regaction')
			.send(profile)
			.expect(200)
			.end(function(updateErr, updateRes) {
				if (updateErr) done(updateErr);

				(updateRes.text).should.match('Initial Registration Success');
				//done();
				User.find({userID:user.userID}, function(err, users) {
					users.should.have.length(1);
					(users[0].height).should.equal(190);
					(users[0].gender).should.equal(1);
					(users[0].dob).should.equal(1973);
					(users[0].waistSize).should.equal(80);
					(users[0].lastName).should.equal('aa');
					(users[0].firstName).should.equal('bb');
					(users[0].accessCode).should.equal('edu401a');
					(users[0].bmi).should.equal(21.32964);
					(new Date(users[0].registrationTime)).should.eql(new Date('2015-03-19T16:27:59-0400'));
					done();
				});
			});
	});


	it('it should return error when updating user profile if user not exist', function(done) {
		var profile ={Profile: '<Profile> '+
		'<UserID>' + 'not exsit user' + '</UserID>'+
		'<Height>190</Height>'+
		'<Gender>1</Gender>'+
		'<DOB>1973</DOB>'+
		'<WaistSize>80</WaistSize>'+
		'<LastName>aa</LastName>'+
		'<FirstName>bb</FirstName>'+
		'<OrganizationCode>edu401a</OrganizationCode>'+
		'<BMI>21.32964</BMI> '+
		'<Points></Points>'+
		'<PromoteMessage></PromoteMessage>'+
		'<updatedTime>2015-03-19T16:27:59-0400</updatedTime>'+
		'<RegistrationTime>2015-03-19T16:27:59-0400</RegistrationTime>'+
		'</Profile>'};

		agent.post('/GlucoGuide/regaction')
			.send(profile)
			.expect(400)
			.end(function(updateErr, updateRes) {
				if (updateErr) done(updateErr);
				(updateRes.body.message).should.match('Failed to update user profile.');
				done();
			});
	});

	//TODO: add code to test retrieve recommendation
	it('should able to retrieve recommendation', function(done) {
		var recrequest = {infile:'<Recommendation_Request>'+
							'<UserID>'+user.userID +'</UserID>' +
							'<VersionNumber>2.1.3</VersionNumber>' +
							'<Latest_RecommendationTime>2015-03-19T16:27:59-0400</Latest_RecommendationTime>' +
						'</Recommendation_Request>'};

		agent.post('/GlucoGuide/recaction')
			.send(recrequest)
			.expect(200)
			.end(function(getErr, getRes) {
				if (getErr) done(getErr);
				(getRes.text).should.match('No Recommendation');
				//console.log(getRes.text);
				done();
			});

	});

	// it('should able to retrieve recommendation after server generate .', function(done) {
	//
	// 	this.timeout(6000);
	// 	var sys = require('sys')
	// 	var exec = require('child_process').exec;
	//
	// 	exec("mongoimport -d mean-test -c knowledges --file ./app/tests/knowledges.json", function(error, stdout, stderr){
	// 		exec("pwd;cd ../tipsGenerator/tools; node genDailyTip.js", function (error, stdout, stderr) {
	// 			console.log('stdout: ' + stdout);
	// 			console.log('stderr: ' + stderr);
	// 			if (error !== null) {
	// 				console.log('exec error: ' + error);
	// 				return done(error);
	// 			}
	//
	// 			exec("pwd;cd ../tipsGenerator/tools; node genDailyTip.js", function (error, stdout, stderr) {
	// 				console.log('stdout: ' + stdout);
	// 				console.log('stderr: ' + stderr);
	// 				if (error !== null) {
	// 					console.log('exec error: ' + error);
	// 					return done(error);
	// 				}
	// 				var recrequest = {
	// 					infile: '<Recommendation_Request>' +
	// 					'<UserID>' + user2.userID + '</UserID>' +
	// 					'<VersionNumber>2.1.3</VersionNumber>' +
	// 					'<Latest_RecommendationTime>2015-03-19T16:27:59-0400</Latest_RecommendationTime>' +
	// 					'</Recommendation_Request>'
	// 				};
	//
	// 				agent.post('/GlucoGuide/recaction')
	// 					.send(recrequest)
	// 					.expect(200)
	// 					.end(function (getErr, getRes) {
	// 						if (getErr) done(getErr);
	// 						parseString(getRes.text, function(err, data){
	// 							if (!data || !data.Recommendations || data.Recommendations.Recommendation.length != 2) {
	// 								done(new Error("Get Recommendation failed"));
	// 							}
	// 							else {
	// 								if(data.Recommendations.Recommendation[0].Content === data.Recommendations.Recommendation[1].Content) {
	// 									done(new Error("Get repeated Recommendation"));
	// 								}
	// 								done();
	// 							}
	// 						});
	// 					});
	// 			});
	// 		});
	// 	});
	//
	// });


	it('should return error if user not found when retrieving recommendation', function(done) {
		var recrequest = {infile:'<Recommendation_Request>'+
		'<UserID>'+'some unknow user' +'</UserID>' +
		'<VersionNumber>2.1.3</VersionNumber>' +
		'<Latest_RecommendationTime>2015-03-19T16:27:59-0400</Latest_RecommendationTime>' +
		'</Recommendation_Request>'};

		agent.post('/GlucoGuide/recaction')
			.send(recrequest)
			.expect(400)
			.end(function(getErr, getRes) {
				if (getErr) done(getErr);
				(getRes.text).should.match('No such user');
				//console.log(getRes.text);
				done();
			});
	});


	// Testing for records:

	it('should add meal by quick estimate', function(done) {
		var recrequest = {userRecord:'<User_Record>'+
									'    <UserID>'+ user.userID + '</UserID>'+
									'    <Meal_Records>'+
									'        <Meal_Record>'+
									'            <Food_Records>'+
									'            </Food_Records>'+
									'            <Carb>22.0</Carb>'+
									'            <Pro>0.0</Pro>'+
									'            <Fat>0.0</Fat>'+
									'            <Cals>88.0</Cals>'+
									'            <MealPhoto>meal_20150618.jpg</MealPhoto>'+
									'            <DeviceMealID>uuid-uuid-uuid-uuid</DeviceMealID>'+
									'            <MealType>3</MealType>'+
									'            <MealEnterType>1</MealEnterType>'+
									'            <RecordedTime>2015-03-19T16:27:59-0400</RecordedTime>'+
									'        </Meal_Record>'+
									'    </Meal_Records>'+
									'    <Created_Time>2015-03-19T16:27:59-0400</Created_Time>'+
									'</User_Record>'
		};

		agent.post('/GlucoGuide/Write')
			.send(recrequest)
			.expect(200)
			.end(function(getErr, getRes) {
				if (getErr) done(getErr);
				(getRes.text).should.match('success');
				Meal.find({deviceMealID: 'uuid-uuid-uuid-uuid'}, function(err, data){
					data.should.have.length(1);
				});
				done();
			});
	});




	it('should update existing meal ', function(done) {
		var recrequest = {userRecord:'<User_Record>'+
		'    <UserID>'+ user.userID + '</UserID>'+
		'    <Meal_Records>'+
		'        <Meal_Record>'+
		'            <Food_Records>'+
		'            </Food_Records>'+
		'            <Carb>22.0</Carb>'+
		'            <Pro>0.0</Pro>'+
		'            <Fat>0.0</Fat>'+
		'            <Cals>88.0</Cals>'+
		'            <MealPhoto>meal_20150618.jpg</MealPhoto>'+
		'            <DeviceMealID>uuid-uuid-uuid-uuid</DeviceMealID>'+
		'            <MealType>3</MealType>'+
		'            <MealEnterType>1</MealEnterType>'+
		'            <RecordedTime>2015-03-19T16:27:59-0400</RecordedTime>'+
		'        </Meal_Record>'+
		'    </Meal_Records>'+
		'    <Created_Time>2015-03-19T16:27:59-0400</Created_Time>'+
		'</User_Record>'
		};
		var mealTypeList = ['Snack', 'Breakfast', 'Lunch', 'Supper'];
		var mealEnterTypeList = ['QuickEstimate', 'Search'];

		agent.post('/GlucoGuide/Write')
			.send(recrequest)
			.expect(200)
			.end(function(getErr, getRes) {
				if (getErr) done(getErr);
				(getRes.text).should.match('success');
				Meal.find({deviceMealID: 'uuid-uuid-uuid-uuid'}, function(err, data){
					data.should.have.length(1);
					(data[0].carb).should.equal(22.0);
					(data[0].pro).should.equal(0.0);
					(data[0].fat).should.equal(0.0);
					(data[0].cals).should.equal(88.0);
					(data[0].mealType).should.match(mealTypeList[3]);
					(data[0].mealEnterType).should.match(mealEnterTypeList[1]);
					//done(err)

					var recrequest = {userRecord:'<User_Record>'+
					'    <UserID>'+ user.userID + '</UserID>'+
					'    <Meal_Records>'+
					'        <Meal_Record>'+
					'            <Food_Records>'+
					'            </Food_Records>'+
					'            <Carb>1.0</Carb>'+
					'            <Pro>2.0</Pro>'+
					'            <Fat>3.0</Fat>'+
					'            <Cals>4.0</Cals>'+
					'            <MealPhoto>meal_20150618.jpg</MealPhoto>'+
					'            <DeviceMealID>uuid-uuid-uuid-uuid</DeviceMealID>'+
					'            <MealType>1</MealType>'+
					'            <MealEnterType>0</MealEnterType>'+
					'            <RecordedTime>2015-03-19T16:27:59-0400</RecordedTime>'+
					'        </Meal_Record>'+
					'    </Meal_Records>'+
					'    <Created_Time>2015-03-19T16:27:59-0400</Created_Time>'+
					'</User_Record>'
					};

					agent.post('/GlucoGuide/Write')
						.send(recrequest)
						.expect(200)
						.end(function(getErr, getRes) {
							if (getErr) done(getErr);
							(getRes.text).should.match('success');
							Meal.find({deviceMealID: 'uuid-uuid-uuid-uuid'}, function(err, data){
								data.should.have.length(1);
								console.log(data);
								(data[0].carb).should.equal(1.0);
								(data[0].pro).should.equal(2.0);
								(data[0].fat).should.equal(3.0);
								(data[0].cals).should.equal(4.0);
								(data[0].mealPhoto).should.match('meal_20150618.jpg');
								(new Date(data[0].recordedTime)).should.eql(new Date('2015-03-19T16:27:59-0400'));
								(data[0].mealType).should.match(mealTypeList[1]);
								(data[0].mealEnterType).should.match(mealEnterTypeList[0]);
								done(err);

							});
						});
				});
			});
	});


	it('should not save image url if not present', function(done) {
		var recrequest = {userRecord:'<User_Record>'+
		'    <UserID>'+ user.userID + '</UserID>'+
		'    <Meal_Records>'+
		'        <Meal_Record>'+
		'            <Food_Records>'+
		'            </Food_Records>'+
		'            <Carb>22.0</Carb>'+
		'            <Pro>0.0</Pro>'+
		'            <Fat>0.0</Fat>'+
		'            <Cals>88.0</Cals>'+
		'            <DeviceMealID>uuid-uuid-uuid-uuid</DeviceMealID>'+
		'			 <MealPhoto></MealPhoto>'+
		'            <MealType>3</MealType>'+
		'            <MealEnterType>1</MealEnterType>'+
		'            <RecordedTime>2015-03-19T16:27:59-0400</RecordedTime>'+
		'        </Meal_Record>'+
		'    </Meal_Records>'+
		'    <Created_Time>2015-03-19T16:27:59-0400</Created_Time>'+
		'</User_Record>'
		};

		agent.post('/GlucoGuide/Write')
			.send(recrequest)
			.expect(200)
			.end(function(getErr, getRes) {
				if (getErr) done(getErr);
				(getRes.text).should.match('success');
				Meal.find({deviceMealID: 'uuid-uuid-uuid-uuid'}, function(err, data){
					data.should.have.length(1);
					console.log(data);
					should(data[0].mealPhoto).equal(undefined);
					done(err);
				});
			});
	});


	it('should add meal when no device meal id present', function(done) {
	 var recrequest = {userRecord:'<User_Record>'+
	 '    <UserID>'+ user.userID + '</UserID>'+
	 '    <Meal_Records>'+
	 '        <Meal_Record>'+
	 '            <Food_Records>'+
	 '            </Food_Records>'+
	 '            <Carb>22.0</Carb>'+
	 '            <Pro>0.0</Pro>'+
	 '            <Fat>0.0</Fat>'+
	 '            <Cals>88.0</Cals>'+
	 '			 <MealPhoto></MealPhoto>'+
	 '            <MealType>3</MealType>'+
	 '            <MealEnterType>1</MealEnterType>'+
	 '            <RecordedTime>2015-03-19T16:27:59-0400</RecordedTime>'+
	 '        </Meal_Record>'+
	 '    </Meal_Records>'+
	 '    <Created_Time>2015-03-19T16:27:59-0400</Created_Time>'+
	 '</User_Record>'
	 };

	 agent.post('/GlucoGuide/Write')
		 .send(recrequest)
		 .expect(200)
		 .end(function(getErr, getRes) {
			 (getRes.text).should.match('success');
			 done();

		 });
	 });


	it('should add new meal when device meal id is empty', function(done) {
		var recrequest = {userRecord:
		'<User_Record>'+
		'   <UserID>' + user.userID + '</UserID>'+
		'   <Glucoses_Records />'+
		'   <Meal_Records>'+
		'      <Meal_Record>'+
		'         <Food_Records />'+
		'         <MealPhoto />'+
		'         <Carb>35.11294</Carb>'+
		'         <Pro>14.0451765</Pro>'+
		'         <Fat>9.363452</Fat>'+
		'         <Cals>280.90353</Cals>'+
		'         <MealEnterType>0</MealEnterType>'+
		'         <DeviceMealID />'+
		'         <RecordedTime>2015-07-27T12:36:29-0400</RecordedTime>'+
		'      </Meal_Record>'+
		'   </Meal_Records>'+
		'   <Sleep_Records />'+
		'   <Exercise_Records />'+
		'   <Note_Records />' +
		'</User_Record>'
		};

		agent.post('/GlucoGuide/Write')
			.send(recrequest)
			.expect(200)
			.end(function(getErr, getRes) {
				(getRes.text).should.match('success');
				done();

			});
	});

	it('should add new meal when device meal id is null', function(done) {
		var recrequest = {userRecord:
		'<User_Record>'+
		'   <UserID>' + user.userID + '</UserID>'+
		'   <Glucoses_Records />'+
		'   <Meal_Records>'+
		'      <Meal_Record>'+
		'         <Food_Records />'+
		'         <MealPhoto />'+
		'         <Carb>35.11294</Carb>'+
		'         <Pro>14.0451765</Pro>'+
		'         <Fat>9.363452</Fat>'+
		'         <Cals>280.90353</Cals>'+
		'         <MealEnterType>0</MealEnterType>'+
		'         <DeviceMealID>null</DeviceMealID>'+
		'         <RecordedTime>2015-07-27T12:36:29-0400</RecordedTime>'+
		'      </Meal_Record>'+
		'   </Meal_Records>'+
		'   <Sleep_Records />'+
		'   <Exercise_Records />'+
		'   <Note_Records />' +
		'</User_Record>'
		};

		agent.post('/GlucoGuide/Write')
			.send(recrequest)
			.expect(200)
			.end(function(getErr, getRes) {
				(getRes.text).should.match('success');
				done();

			});
	});

	it('should return error when xml is ill formed.', function(done) {
		var recrequest = {userRecord:
		'<User_Record'+
		'   <UserID>' + user.userID + '</UserID>'+
		'   <Glucoses_Records />'+
		'   <Meal_Records>'+
		'      <Meal_Record>'+
		'         <Food_Records />'+
		'         <MealPhoto />'+
		'         <Carb>35.11294</Carb>'+
		'         <Pro>14.0451765</Pro>'+
		'         <Fat>9.363452</Fat>'+
		'         <Cals>280.90353</Cals>'+
		'         <MealEnterType>0</MealEnterType>'+
		'         <DeviceMealID>null</DeviceMealID>'+
		'         <RecordedTime>2015-07-27T12:36:29-0400</RecordedTime>'+
		'      </Meal_Record>'+
		'   </Meal_Records>'+
		'   <Sleep_Records />'+
		'   <Exercise_Records />'+
		'   <Note_Records />' +
		'</User_Record>'
		};

		agent.post('/GlucoGuide/Write')
			.send(recrequest)
			.expect(400)
			.end(function(getErr, getRes) {
				(getRes.text).should.match('duplicated');
				done();

			});
	});

	it('should add new meal when device meal id is empty and no food is present', function(done) {
		var recrequest = {userRecord:
		'<User_Record>'+
		'   <UserID>' + user.userID + '</UserID>'+
		'   <Glucoses_Records />'+
		'   <Meal_Records>'+
		'      <Meal_Record>'+
		'         <MealPhoto />'+
		'         <Carb>35.11294</Carb>'+
		'         <Pro>14.0451765</Pro>'+
		'         <Fat>9.363452</Fat>'+
		'         <Cals>280.90353</Cals>'+
		'         <MealEnterType>0</MealEnterType>'+
		'         <DeviceMealID />'+
		'         <RecordedTime>2015-07-27T12:36:29-0400</RecordedTime>'+
		'      </Meal_Record>'+
		'   </Meal_Records>'+
		'   <Sleep_Records />'+
		'   <Exercise_Records />'+
		'   <Note_Records />' +
		'</User_Record>'
		};

		agent.post('/GlucoGuide/Write')
			.send(recrequest)
			.expect(200)
			.end(function(getErr, getRes) {
				(getRes.text).should.match('success');
				done();
			});
	});
/*	it('should return error when no device meal id present', function(done) {
		var recrequest = {userRecord:'<User_Record>'+
		'    <UserID>'+ user.userID + '</UserID>'+
		'    <Meal_Records>'+
		'        <Meal_Record>'+
		'            <Food_Records>'+
		'            </Food_Records>'+
		'            <Carb>22.0</Carb>'+
		'            <Pro>0.0</Pro>'+
		'            <Fat>0.0</Fat>'+
		'            <Cals>88.0</Cals>'+
		'			 <MealPhoto></MealPhoto>'+
		'            <MealType>3</MealType>'+
		'            <MealEnterType>1</MealEnterType>'+
		'            <RecordedTime>2015-03-19T16:27:59-0400</RecordedTime>'+
		'        </Meal_Record>'+
		'    </Meal_Records>'+
		'    <Created_Time>2015-03-19T16:27:59-0400</Created_Time>'+
		'</User_Record>'
		};

		agent.post('/GlucoGuide/Write')
			.send(recrequest)
			.expect(400)
			.end(function(getErr, getRes) {
				(getRes.text).should.match('duplicated');
				done();

			});
	});


	it('should return error when no device meal id present', function(done) {
		var recrequest = {userRecord:
		'<User_Record>'+
		'   <UserID>' + user.userID + '</UserID>'+
		'   <Glucoses_Records />'+
		'   <Meal_Records>'+
		'      <Meal_Record>'+
		'         <Food_Records />'+
		'         <MealPhoto />'+
		'         <Carb>35.11294</Carb>'+
		'         <Pro>14.0451765</Pro>'+
		'         <Fat>9.363452</Fat>'+
		'         <Cals>280.90353</Cals>'+
		'         <MealEnterType>0</MealEnterType>'+
		'         <DeviceMealID />'+
		'         <RecordedTime>2015-07-27T12:36:29-0400</RecordedTime>'+
		'      </Meal_Record>'+
		'   </Meal_Records>'+
		'   <Sleep_Records />'+
		'   <Exercise_Records />'+
		'   <Note_Records />' +
		'</User_Record>'
		};

		agent.post('/GlucoGuide/Write')
			.send(recrequest)
			.expect(400)
			.end(function(getErr, getRes) {
				(getRes.text).should.match('duplicated');
				done();

			});
	});
*/
	afterEach(function(done) {
		User.remove().exec();
		Meal.remove().exec(done);

	});
});
