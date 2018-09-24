var mongoose = require('mongoose');
var _ = require('lodash');
process.chdir(__dirname);

mongoose.connect('mongodb://localhost:27017/rawdata');

var express = require("express");
var request = require('request');
var bodyparser = require("body-parser");
var logger = require("./lib/logger");
var devconfig = require("./lib/devconfig");
var prodconfig = require("./lib/prodconfig");

var sendRequest = require('./util/sendRequest');
var loginCtrl = require('./controllers/login.server.controller');
//logging
var assert = require('assert');

var KScoreCtrl = require('./controllers/knowledgescore.server.controller');
var TopicCtrl = require('./controllers/topics.server.controller');
var KnowledgeCtrl = require('./controllers/knowledge.server.controller');
var KConditionCtrl = require('./controllers/knowledgecondition.server.controller');
var CFunciton = require('./controllers/conditionfunction.server.controller');
var ProfileCtrl = require('./controllers/profiles.server.controller');
var count = 0;
var SKIP_POSS = 0.5;

var getKnowledge = function(login_cookie, knowledgeList, userinfo, callback) {
	var return_knowledges = [];
	KConditionCtrl.checkConditionsByType(userinfo, userinfo.tiptype, function(err, kconditions){
		console.log('Find max score complete');
		// console.log(kconditions);
		kconditions.forEach(function(temp_kc, i_kc, a_kc){
			return_knowledges.push(temp_kc);
		});
		console.log('Adjust scores complete');
		callback(null, return_knowledges);
	});
};

var saveCombinedTip = function(login_cookie, knowledgeList, user, creatorID, callback){
	// var userID = user.userID;
	// console.log(user);
	KConditionCtrl.initial_user_data_for_meal(user, function(err, data){
		if(err){
			console.error(err);
			callback(err);
		}else{
			// console.log(user, data);
			var userinfo = _.assign(user, data, data.profile, data.mealNutrition);
			console.log(user, data);
			getKnowledge(login_cookie, knowledgeList, userinfo, function(err, knowledges){
				if(err) {
					console.log('getKnowledge err' + err.toString());
				}
				if(knowledges.length > 0){
					// console.log(knowledges);
					TopicCtrl.createByCombinedKnowledgeTemplate(login_cookie, knowledges, userinfo, creatorID, function(err, response, data){
						if(err){
							callback(err,response,data);
						}else{
							callback(null,response,data);
						}
					});
				}else{
					console.log('No knowledge matched.')
				}
			});
		}
	});
};


var getKnowledgeAll = function(login_cookie, knowledgeList, userinfo, callback) {
	var return_knowledges = [];
	KConditionCtrl.checkConditionsByTypeAll(userinfo, userinfo.tiptype, function(err, kconditions){
		console.log('Find max score complete');
		console.log(kconditions);
		knowledgeList.forEach(function(knowledge){
			kconditions.forEach(function(temp_kc, i_kc, a_kc){
				// console.log(knowledge._id.toString() === temp_kc.toString(),knowledge._id,temp_kc.toString())
				if(knowledge._id === temp_kc.toString()){
					return_knowledges.push(temp_kc);
				}
			});
		});
		console.log('Adjust scores complete');
		callback(null, return_knowledges);
		//console.log("return knowledges are: ",return_knowledges);
	});
};

var saveTips = function(login_cookie, knowledgeList, user, creatorID, callback){
	// var userID = user.userID;
	// console.log(user);
	KConditionCtrl.initial_user_data(user, function(err, data){
		if(err){
			console.error(err);
			callback(err);
		}else{
			// console.log(user, data);
			var userinfo = _.assign(user, data, data.profile, data.mealNutrition);
			//console.log("****************Information*********************\n", user, data);
			//console.log("-------------------------------------------------------------");
			getKnowledgeAll(login_cookie, knowledgeList, userinfo, function(err, knowledges){
				if(err) {
					console.log('getKnowledge err' + err.toString());
				}
				if(knowledges.length > 0){
					//console.log("This is the final knowleges: ",knowledges);
					TopicCtrl.createByKnowledgeTemplate(login_cookie, knowledges, userinfo, creatorID, function(err, response, data){
						if(err){
							callback(err,response,data);
						}else{
							callback(null,response,data);
						}
					});
				}
			});
		}
	});
};


var app  = express();

// body parser middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.post('/tipsgenerator/meal', function(req, res){
	// logger.log('info',req.body);
	var userID = req.body.user;
	var meal = req.body.meal;
	if(meal.mealType != 'Snack'){
		loginCtrl.login(function(cookie, creator){
			// console.log(cookie, creator);
			ProfileCtrl.findByID(userID, function(err,data){
				if(err){
					console.log('ProfileCtrl.findByID err'+ err.toString());
				}else{
					var user = data.toObject();
					user.meal = meal;
					user.tiptype = 'meal';
					user.reference = meal.mealID;
					// console.log(user);
					KnowledgeCtrl.listByType(cookie, 2,function(err, knowledgeList){
						if(err){
							return console.log('KnowledgeCtrl.listByType err'+ err.toString());
						}
						// console.log(knowledgeList);
						console.log('USERID: '+user.userID);
						if(process.env.DATE){
							user.target_date = new Date(process.env.DATE);
							console.log('DATE: '+user.target_date);
						}
						saveCombinedTip(cookie, knowledgeList, user, creator.userID, function(err,response,data){
							if(err){
								console.log(err +' '+ response +' '+ data);
							}else{
								console.log('finished');
								// mongoose.connection.close();
							}
						});
					});
				}
					//mongoose.connection.close();
			});
		});
	}
});

app.post('/tipsgenerator/accesscode/ggdpp', function(req, res){
	// logger.log('info',req.body);
	var userID = req.body.user;
	var accessCode = req.body.accesscode;
	loginCtrl.login(function(cookie, creator){
		// console.log(cookie, creator);
		ProfileCtrl.findByID(userID, function(err,data){
			if(err){
				console.log('ProfileCtrl.findByID err'+ err.toString());
			}else{
				var user = data.toObject();
				user.tiptype = 'dpp';
				KnowledgeCtrl.listByType(cookie, 2,function(err, knowledgeList){
					if(err){
						return console.log('KnowledgeCtrl.listByType err'+ err.toString());
					}
					console.log('USERID: '+user.userID);
					if(process.env.DATE){
						user.target_date = new Date(process.env.DATE);
						console.log('DATE: '+user.target_date);
					}
					saveTips(cookie, knowledgeList, user, creator.userID, function(err,response,data){
						if(err){
							console.log(err +' '+ response +' '+ data);
						}else{
							console.log('finished');
							// mongoose.connection.close();
						}
					});
				});
			}
				//mongoose.connection.close();
		});
	});
});

app.post('/tipsgenerator/accesscode/nonacscode', function(req, res){
    var userID = req.body.user;
    loginCtrl.login(function(cookie, creator){
        // console.log(cookie, creator);
        ProfileCtrl.findByID(userID, function(err,data){
            if(err){
                console.log('ProfileCtrl.findByID err'+ err.toString());
            }else{
                var user = data.toObject();
                //console.log('---------------------------------USERID: \n',user);
                user.tiptype = 'nonacscode';
                KnowledgeCtrl.listByType(cookie, 2,function(err, knowledgeList){
                    if(err){
                        return console.log('KnowledgeCtrl.listByType err'+ err.toString());
                    }
                    if(process.env.DATE){
                        user.target_date = new Date(process.env.DATE);
                        console.log('DATE: '+user.target_date);
                    }
                    saveTips(cookie, knowledgeList, user, creator.userID, function(err,response,data){
                        if(err){
                            console.log(err +' '+ response +' '+ data);
                        }else{
                            console.log('finished');
                            // mongoose.connection.close();
                        }
                    });
                });
            }
            //mongoose.connection.close();
        });
    });
});

// Error handling middleware
app.use(function(err, req, res, next) {

  if(err.status == 500){
    res.status(500).send('Internal server error');
  }
  if(err.status == 404){
    res.status(404).send('Not found');
  }

});

// Port setup
var port = process.argv[2] || 30005;

// Server setup
var server = app.listen(port, function () {

    var host = server.address().address;
    var port = server.address().port;
    logger.log("info", host );
    logger.log("info", port)

});

module.exports = app;
