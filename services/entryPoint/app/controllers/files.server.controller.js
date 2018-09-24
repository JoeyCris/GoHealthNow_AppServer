'use strict';

var _ = require('lodash'),
	fs = require('fs'),
	errorHandler = require('./errors.server.controller.js'),
	mongoose = require('mongoose');


exports.uploadFiles = function(req, res) {
	// console.log(req.body);
	// console.dir(req.files);
	// console.log(req.files);
	var tmp_path = req.files.file.path;

	// TODO: find a better place to save uploaded files.
	var user_dir = './public/images/knowledge';
	var target_path = user_dir + '/' + req.files.file.originalname;
	var view_path = 'images/knowledge/'+ req.files.file.originalname;
	if (!fs.existsSync(user_dir)){
		fs.mkdirSync(user_dir);
	}
	// var dirname = require('path').dirname(require.main.filename);
	// console.log(req.body.type === '3');

	if(req.body.type === '1'){ // for questions
		user_dir = './public/images/' + req.body.user_id;
		target_path = user_dir + '/' + req.files.file.originalname;
		view_path = 'images/'+req.body.user_id + '/'+ req.files.file.originalname;
		if (!fs.existsSync(user_dir)){
			fs.mkdirSync(user_dir);
		}
	}else if (req.body.type === '2') { // for answers
		user_dir = './public/images/' + req.body.user_id;
		if (!fs.existsSync(user_dir)){
			fs.mkdirSync(user_dir);
		}
		user_dir = user_dir + '/answers';
		if (!fs.existsSync(user_dir)){
			fs.mkdirSync(user_dir);
		}
		target_path = user_dir + '/' + req.files.file.originalname;
		view_path = 'images/'+req.body.user_id + '/answers/'+ req.files.file.originalname;

		// var dirname = require('path').dirname(require.main.filename);
	} else if( req.body.type === '3') {
		//for brand
		user_dir = './public/images/brand';
		if (!fs.existsSync(user_dir)){
			fs.mkdirSync(user_dir);
		}
		target_path = user_dir + '/' + req.files.file.originalname;
		view_path = 'images/brand/' + req.files.file.originalname;
	}
	else if(req.body.type==='4'){//for audios 
		user_dir = './public/audio';
		if (!fs.existsSync(user_dir)){
			fs.mkdirSync(user_dir);
		}
		target_path = user_dir + '/' + req.files.file.originalname;
		view_path = 'audio/' + req.files.file.originalname;
		//----
		console.log('http://' + req.headers.host+'/'+view_path);
	}


	fs.rename(tmp_path, target_path, function(err) {
		if (err) {
			console.log('In files.server.ctrl: upload files: failed to rename: ', err.message);
			return res.status(400).end('File upload failed.');
		} else {
			fs.unlink(tmp_path, function(){
				if (err) {
					return res.status(400).end('File upload failed...');
				} else {
					// console.log({uri: view_path, mimeType: req.files.file.mimetype}+'!!!!!!!!!!');
					//console.log('view_path='+view_path);
					//console.log("mimetype="+req.files.file.mimetype);
					res.json({uri: view_path, mimeType: req.files.file.mimetype});
					//console.log('file got '+view_path+'\n');
				}

			});
		}
	});

};

exports.downloadFiles = function(req, res) {
	// console.log(req.query.name, req.query.userID);
	// res.setHeader('Content-Type','application/octet-stream');
	// res.setHeader('Content-Disposition','attachment; filename=out.pdf');
	res.render('templates/download', {
		url: '/images/'+req.query.userID+'/'+req.query.name,
		appName: 	123,
		content: 231,
		// unsubscribe: 'https://'+req.headers.host+'/email/unsubscribe/'+user._id
	});
};
