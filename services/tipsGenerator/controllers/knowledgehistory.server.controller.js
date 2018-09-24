/**
 * Module dependencies.
 */
 require('../models/knowledgehistory');
var mongoose = require('mongoose'),
	_ = require('lodash'),
	KHistory = mongoose.model('KnowledgeHistory');
var ProfileCtrl = require('./profiles.server.controller');
var TopicCtrl = require('./topics.server.controller');


var khistoryByUserId = function(userID, callback) {

	 KHistory.findOne({user:userID}).exec(function(err, khistory){
		 if (err) {
			 return callback(err);
		 }
		 if (!khistory) {
			 khistory = new KHistory({user:userID,history:[]});
			 khistory.save(function(err) {
				 if (err) {
					 callback(err);
				 }else{
					 callback(null, khistory);
				 }
			 });
		 }else{
			 callback(null, khistory);
		 }
	 });
};

/**
 * Create Knowledge History
 * tested
 */
 exports.create = function(knowledgehistory, callback) {
 	var khistory = new KHistory(knowledgehistory);
 	khistory.save(function(err) {
 		if (err) {
 			callback(err);
 		} else {
			callback(null, khistory);
 		}
 	});
 };

 /**
  * Update a knowledge history
  */
 exports.update = function(khistory, knowledgehistory, callback) {
 	//var khistory = KHistory();
 	khistory = _.extend(khistory, knowledgehistory);
 	khistory.save(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(khistory);
 		}
 	});
 };


 /**
 * Read knowledge history by ID
 */

 exports.read = function(login_cookie, knowledgeList, userID, callback){
	var user = {userID:userID};
	var knowledges = knowledgeList;
	var history_dict = {};
	khistoryByUserId(userID, function(err, khistory){
		if(err || !khistory){
			return callback(err);
		}else{
			//console.log(khistory.history.length+' '+knowledges.length);
			//var khistory = req.khistory;
			if(khistory.history.length !== knowledges.length){
				knowledges.forEach(function(temp_knowledge, index, array){
					var is_exist = false;
          var min_history = 10000;
          if(khistory.history.length > 0){
            min_history =  khistory.history[0]['adopt_times'];
          }
					khistory.history.forEach(function(temp_history, index, array){
						if(temp_history.knowledgeId === temp_knowledge._id){
							is_exist = true;
							history_dict[temp_history.knowledgeId] = temp_history.adopt_times;
						}
            if(temp_history.adopt_times <min_history){
              min_history = temp_history.adopt_times;
            }
						// console.log(temp_knowledge+' '+temp_history+' '+is_exist);
					});
					if(!is_exist){
						khistory.history.push({knowledgeId:temp_knowledge._id, adopt_times:min_history});
						history_dict[temp_knowledge._id] = min_history;
					}
				});
			}else{
				khistory.history.forEach(function(temp_history, index, array){
					history_dict[temp_history.knowledgeId] = temp_history.adopt_times;
				});
			}
			//console.log(khistory);
			khistory.save(function(err) {
		 		if (err) {
		 			return callback(err);
		 		} else {
					console.log('Update history success');
					var u = user;
					u.historydict = history_dict;
					u.history = khistory;
					callback(null, u);
		 		}
		 	});
		}
	});

};

 /**
  * Delete a knowledge history
  */
 exports.delete = function(khistory, callback) {
 	khistory.remove(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.json(khistory);
 		}
 	});
 };

 /**
  * List of knowledge histories
  */
 exports.list = function(callback) {
 	KHistory.find({}, function(err, khistory) {
 		if (err) {
 			return callback(err);
 		} else {
 			return callback(null, khistory);
 		}
 	});
 };

 /**
  * knowledge history middleware
  */
 exports.khistoryByUserId = khistoryByUserId;

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
