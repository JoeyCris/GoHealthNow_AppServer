/**
 *
 * Created by Canon on 2016-02-04.
 */
'use strict';

var mongoose = require('mongoose');

var brand = mongoose.model('Brand');
var user = mongoose.model('User');
var genXmlOutput = require('../utils/genxmloutput');
var errorHandler = require('./errors.server.controller');

var genXmlOutputPlain = function(rootTag, jsonObj) {
	return genXmlOutput(rootTag, jsonObj, { 'pretty': false, 'indent': '', 'newline': '' });
};

exports.save = function(req, res) {
	if(typeof req.body.brandID === 'undefined') {
		res.redirect(307, '/GlucoGuide/brand/create');
	} else {
		res.redirect(307, '/GlucoGuide/brand/update');
	}
};

exports.create = function (req, res) {
	var newBrand = new brand();
	newBrand.brandName = req.body.name;
	newBrand.brandAccessCode = req.body.accessCode;
	newBrand.homePage = req.body.homePage;
	if(req.body.logo && req.body.logo.length > 0)
		newBrand.logo = req.body.logo[0].uri;
	// var newBrand = new brand(req.body);
	console.log(newBrand);
	newBrand.createdDate = new Date();
	newBrand.lastModifiedDate = newBrand.createdDate;

	newBrand.save(function (err,data) {
		if (err) {
			console.error('Cannot save brand information: ', err.message);
			res.status(400).send({
				message: 'Internal Error, cannot save brand information: '+errorHandler.getErrorMessage(err)
			});
		} else {
			// res.send('success');
			res.json({accessCode:data.brandAccessCode});
		}
	});
};

exports.update = function(req, res) {
	console.log(req.body);
	var newBrand = {};
	newBrand.brandName = req.body.name;
	newBrand.brandAccessCode = req.body.accessCode;
	newBrand.homePage = req.body.homePage;
	if(req.body.medias && req.body.medias.length > 0)
		newBrand.logo = req.body.medias[0].uri;
	newBrand.lastModifiedDate = new Date();
	var brandID = req.body.brandID;
	// delete req.body.brandID;
	// delete req.body.createdDate;
	// delete req.body.brandAccessCode;
	// req.body.lastModifiedDate = new Date();
	if(!mongoose.Types.ObjectId.isValid(brandID)) {
		console.log('Invalid brand id');
		return res.status(400).send({message:'Invalid brand id'});
	}
	brand.findOneAndUpdate({_id: new mongoose.Types.ObjectId(brandID)}, newBrand, function(err,data) {
		if(err) {
			console.error('Failed to update the brand info');
			res.status(400).send({message:'Failed to update the brand info: '+errorHandler.getErrorMessage(err)});
		} else {
			// res.send('success');
			console.log(data);
			res.json({accessCode:data.brandAccessCode});
		}
	});
};

/**
 * Delete a knowledge base
 */
exports.delete = function(req, res) {
	console.log(req.params.accessCode);
	var accessCode = req.params.accessCode;
	// if(!mongoose.Types.ObjectId.isValid(brandID)) {
	// 	console.log('Invalid brand id');
	// 	return res.status(400).send('Invalid brand id');
	// }
 brand.remove({brandAccessCode: accessCode},function(err) {
	 if (err) {
		 return res.status(400).send({
			 message: errorHandler.getErrorMessage(err)
		 });
	 } else {
		 res.json({accessCode:accessCode});
	 }
 });
};

exports.list = function (req, res, next) {
	brand.find({}, function(err, data) {
		if (err) {
			console.log(err);
			return res.status(400).send('Querying error in lising brands');
		} else {
			var brands = data.map(function (brand) {
				return {
					brandID: brand._id,
					name: brand.brandName,
					accessCode: brand.brandAccessCode,
					homePage: brand.homePage,
					logo: brand.logo,
					create_time: brand.createdDate
				};
			});
			req.brand = brands;
			return next();
		}
	});
};


exports.read = function(req, res, next) {
	var accessCode = req.accessCode.toLowerCase();
	brand.findOne({brandAccessCode: accessCode}, function(err, data) {
		if(err) {
			console.error('Error when looking for accessCode, ', err.message);
			return res.status(400).send('AccessCode not found');
		} else if(!data) {
			console.log('AccessCode Not Found');
			return res.status(400).send('AccessCode not found');
		} else {
			var Brand = {};
			Brand.brandID = data.id;
			Brand.name = data.brandName;
			Brand.accessCode = data.brandAccessCode;
			Brand.create_time = data.createdDate;
			Brand.homePage = data.homePage;
			Brand.logo = data.logo;
			Brand.medias = [{uri:data.logo,mimeType:''}];
			req.brand = Brand;
			return next();
		}
	});
};

exports.get = function(req, res, next) {
	var accessCode = req.accessCode.toLowerCase();
	brand.findOne({brandAccessCode: accessCode}, function(err, data) {
		if(err) {
			console.error('Error when looking for accessCode, ', err.message);
			return res.status(400).send('AccessCode not found');
		} else if(!data) {
			console.log('AccessCode Not Found');
			return res.status(400).send('AccessCode not found');
		} else {
			var Brand = {};
			Brand.brandID = data.id;
			Brand.name = data.brandName;
			Brand.homePage = data.homePage;
			Brand.logo = data.logo;
			req.appbrand = Brand;
			return next();
		}
	});
};

exports.res2json = function(req, res) {
	res.json(req.brand);
};

exports.res2xml = function(req, res) {
	var Brand = req.appbrand;
	var outXMl = genXmlOutputPlain('Brand', Brand);
	res.send(outXMl);
};



exports.hasAccessCodeAuth = function(req, res, next) {
	var userID = req.userID;
	var accessCode = req.accessCode;

	if (!mongoose.Types.ObjectId.isValid(userID)) {
		return res.status(400).send('Invalid userID');
	}
	var userObjectId = new mongoose.Types.ObjectId(userID);

	user.findOne({_id: userObjectId}, function (err, doc) {
		if (err) {
			console.error('Error when looking for user', err.message);
			res.status(400).send('No user found');
		} else if (!doc) {
			console.log('No user found');
			res.status(400).send('No user found');
			//} else if (doc.accessCode !== accessCode) {
			//	console.log('access codes do not match');
			//	res.status(400).send('Access codes do not match');
		} else {
			next();
		}
	});
};


exports.parseXmlReq = function (req, res, next) {
	var xml = req.body.accesscode;
	if(typeof xml === 'undefined' || !xml) {
		console.log('error in request body');
		return res.status(400).send('Xml format error');
	}

	var parseString = require('xml2js').parseString;

	var toLowerCase = function (name) {
		return name.charAt(0).toLowerCase() + name.slice(1);
	};

	parseString(xml, {
		tagNameProcessors: [toLowerCase],
		explicitArray: false,
		trim: true
	}, function (err, result) {
		if (err) {
			console.log(err);
			return res.status(400).send('Xml format error');
		}
		req.userID = result.brandInfo.userID;
		req.accessCode = result.brandInfo.accessCode;
		next();
	});
};





exports.parseQueryReq = function(req, res, next) {
	req.accessCode = req.params.accessCode;
	next();
};
