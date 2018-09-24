/**
 * Module dependencies.
 */
 require('../models/knowledgescore');
var mongoose = require('mongoose'),
	_ = require('lodash'),
	KScore = mongoose.model('KnowledgeScore');
var ProfileCtrl = require('./profiles.server.controller');
var TopicCtrl = require('./topics.server.controller');


var kscoreByUserId = function(userID, callback) {

	 KScore.findOne({user:userID}).exec(function(err, kscore){
		 if (err) {
			 return callback(err);
		 }
		 if (!kscore) {
			 kscore = new KScore({user:userID,score:[]});
			 kscore.save(function(err) {
				 if (err) {
					 callback(err);
				 }else{
					 callback(null, kscore);
				 }
			 });
		 }else{
			 callback(null, kscore);
		 }
	 });
};

/**
 * Create Knowledge Score
 * tested
 */
 exports.create = function(knowledgescore, callback) {
 	var kscore = new KScore(knowledgescore);
 	kscore.save(function(err) {
 		if (err) {
 			callback(err);
 		} else {
			callback(null, kscore);
 		}
 	});
 };

 /**
  * Update a knowledge score
  */
 exports.update = function(kscore, knowledgescore, callback) {
 	//var kscore = KScore();
 	kscore = _.extend(kscore, knowledgescore);
 	kscore.save(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(kscore);
 		}
 	});
 };


 /**
 * Read knowledge score by ID
 */

 exports.read = function(login_cookie, knowledgeList, userID, callback){
	var user = {userID:userID};
	var knowledges = knowledgeList;
	var score_dict = {};
	kscoreByUserId(userID, function(err, kscore){
		if(err || !kscore){
			return callback(err);
		}else{
      // console.log(kscore.score);
			// console.log(kscore.score.length+' '+knowledges.length);
			//var kscore = req.kscore;
			if(kscore.score.length !== knowledges.length){
				knowledges.forEach(function(temp_knowledge, index, array){
					var is_exist = false;
					kscore.score.forEach(function(temp_score, index, array){
            // console.log(temp_score.knowledgeId.toString() === temp_knowledge._id.toString())
						if(temp_score.knowledgeId.toString() === temp_knowledge._id.toString()){
							is_exist = true;
							score_dict[temp_score.knowledgeId] = temp_score.score;
						}
						// console.log(temp_knowledge+' '+temp_score+' '+is_exist);
					});
					if(!is_exist){
						kscore.score.push({knowledgeId:temp_knowledge._id, score:temp_knowledge.priority});
						score_dict[temp_knowledge._id] = temp_knowledge.priority;
					}
				});
			}else{
				kscore.score.forEach(function(temp_score, index, array){
					score_dict[temp_score.knowledgeId] = temp_score.score;
				});
			}
			//console.log(kscore);
			kscore.save(function(err) {
		 		if (err) {
		 			return callback(err);
		 		} else {
					console.log('Update score success');
					var u = user;
					u.scoredict = score_dict;
					u.score = kscore;
          // console.log(u);
					callback(null, u);
		 		}
		 	});
		}
	});

};

 /**
  * Delete a knowledge score
  */
 exports.delete = function(kscore, callback) {
 	kscore.remove(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(kscore);
 		}
 	});
 };

 /**
  * List of knowledge histories
  */
 exports.list = function(callback) {
 	KScore.find({}, function(err, kscore) {
 		if (err) {
 			return callback(err);
 		} else {
 			return callback(null, kscore);
 		}
 	});
 };

 /**
  * knowledge score middleware
  */
 exports.kscoreByUserId = kscoreByUserId;

// exports.generateTip = function(req, res) {
// 	var cp = require('child_process');
// 	var n = cp.fork('./app/controllers/test.server.js');
// 	n.on('message', function(m) {
// 		console.log('PARENT got message:', m);
// 	});
// 	n.send({ hello: 'world' });
// 	// var tips = generateTipForUsers(function(){
// 	// 	res.json({message:'generate tip'});
// 	// });
// };
