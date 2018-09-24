// var MongoClient = require('mongodb').MongoClient;
var sendEmail = require('./sendEmail.js');
var sleep = require('sleep');
var config = require('./config/config');
var _ = require('lodash');
var fs = require('fs');
var mongoose = require('mongoose');
var url = 'mongodb://localhost:27017/rawdata';
var MAX_EMAIL_PER_DAY = 250;
var header = '';
console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'production'){
	header = config.header.production;
}else if(process.env.NODE_ENV === 'development'){
	header = config.header.development;
}else{
	header = config.header.default;
}

mongoose.connect(url, function(error){
	if(error){
		console.log(error);
	};
});
require('./models/emailtask');
require('./models/user.server.model');

var sendEmailsSync = function(totalCount, count, email){
	var users = email.unsend;
	console.log(totalCount, count, users.length);
	if(count >= users.length){
		console.log('Email: <'+email.title+'> finished');
		email.unsend = _.differenceBy(email.users, email.sended, '_id');
		email.progress = email.sended.length;
		email.status = 'finished';
		email.finish_time = new Date();
		email.save(function(err,email){
			if(err){
				console.log(err);
			}else{
				// console.log(email);
			}
		});
		return;
	}else if(totalCount >= MAX_EMAIL_PER_DAY){
		console.log('Email: <'+email.title+'> interupted');
		email.unsend = _.differenceBy(email.unsend, email.sended, '_id');
		email.progress = email.sended.length;
		email.status = 'ongoing';
		email.interupt_time = new Date();
		email.save(function(err,email){
			if(err){
				console.log(err);
			}else{
				// console.log(email);
			}
		});
		return;
	}

	var user = users[count];
  // console.log(user);
  //send email
  var subject = email.title;
	var content = email.content;
  // fs.readFile('views/templates/new-event.server.view.html', 'utf8', function (err,data) {
	// var newUser = {_id:user._id,email:user.email};
	// if (!(_.some(email.sended,newUser))){
	// 	email.sended.push(newUser);
	// 	// console.log(newUser);
	// }
	// count++
	// sendEmailsSync(count,email);

  sendEmail({},user,subject,content,header,function(err,message){
    if(err){
			console.log(email.error);
			// email.error.push(user);
			console.log('Email: <'+email.title+'> interupted');
			email.unsend = _.differenceBy(email.unsend, email.sended, '_id');
			email.progress = email.sended.length;
			email.status = 'ongoing';
			email.interupt_time = new Date();
			email.save(function(err,email){
				if(err){
					console.log(err);
				}else{
					// console.log(email);
				}
			});
      console.log(err,message);
    }else{
			var newUser = {_id:user._id,email:user.email};
			if (!(_.some(email.sended,newUser))){
				email.sended.push(newUser);
				// console.log(newUser);
			}

			// if (!(_.some(email.sended,user))){
			// 	email.sended.push(user);
			// 	// console.log(newUser);
			// }

      // hasSent.push(user._id);
      // console.log(user);
      // console.log(message);
			count++;
			totalCount++;
			console.log('next round: '+count);
			sendEmailsSync(totalCount,count,email);
    }
		// email.sended.push(user._id);


    sleep.sleep(10);
    // console.log(hasSent);
    // console.log(sentCount);

    // fs.writeFile('hasSent.json',JSON.stringify(hasSent),'utf8',function(err, data){
    //   if(err){
    //     console.log(err);
    //   }
    //   console.log(data)
    // });

    // console.log(count, 'Finished');
    // db.close();
  // });
	});
};

var Email = mongoose.model('Email');

var populateQuery = [{path:'users'}, {path:'sended'}, {path:'unsend'}];//, select:'email'}];
var totalCount = 0;
Email.find({status:{$in:['new','ongoing']}}).populate(populateQuery).exec(function(err, emails){
	if(err){
		console.log(err);
	}else{
		// console.log(emails);
		emails.forEach(function(email,emailidx,emailarr){
			// console.log('unsend: '+email.unsend);
			// console.log('sended: '+email.sended);

			var receivers = [];
			// var unsend = [];
			// var sended = [];
			if(email.status === 'new'){
				email.unsend = email.users;
				email.sended = [];
				email.error = [];
			}else if(email.status === 'ongoing'){
				// receivers = email.unsend;
			}

			email.users.forEach(function(user,useridx,userarr){
				receivers.push(user.email);
				// unsend.push(user._id);
			});
			// console.log(receivers);
			sendEmailsSync(totalCount,0,email);
			totalCount += email.unsend.length;


		});
	}
});








// //Global varaibales
// var conditions = {email:{$in:[]}};
// conditions.email.$in.push('stongagelc@gmail.com');
// conditions.email.$in.push('glucoguide.email.test@gmail.com');
// // conditions.email.$in.push('glucoguide@glucoguide.com');
//
// var hasSent = [];
// var sentCount = 0;
// // conditions.email.$in.push('prof.charles.ling@gmail.com');
// // connection to mongodb
//
//
//
//
//
// var sendEmailsSync = function(count, users){
// 	if(count >= users.length){
// 		return;
// 	}
// 	var user = users[count];
//   // console.log(user);
//   //send email
//   var subject = 'New Event of GlucoGuide';
//   fs.readFile('views/templates/new-event.server.view.html', 'utf8', function (err,data) {
//     sendEmail({},user,subject,data,function(err,message){
//       if(err){
//         count++
//         sendEmailsSync(count,users);
//         console.log(err,message);
//       }else{
//         hasSent.push(user.email);
//         console.log(user);
//         count++;
//         sendEmailsSync(count,users);
//         console.log(message);
//       }
//
//       sleep.sleep(10);
//       // console.log(hasSent);
//       // console.log(sentCount);
//
//       fs.writeFile('hasSent.json',JSON.stringify(hasSent),'utf8',function(err, data){
//         if(err){
//           console.log(err);
//         }
//         console.log(data)
//       });
//
//       console.log(count, 'Finished');
//       // db.close();
//     });
// 	});
// };

// MongoClient.connect(url, function(err, db) {
//   if(err){
//     console.log('MongoDB connection failed: ' + err);
//     return;
//   }
//   console.log("MongoDB connection  successful");
//   var collection = db.collection('emails');
//   // conditions = {email:'stongagelc@gmail.com'};
// 	hasSent = JSON.parse(fs.readFileSync('hasSent.json', 'utf8'));
// 	// console.log(hasSent[0]);
// 	conditions = {status:{$in:['new','ongoing']}};
//   // conditions = {email:/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i, $nor: [{email:/test.com/i},{email:/glucoguide.com/i},{email:/gg.com/i},{email:/ios.com/i}]};
//   collection.find(conditions,{sort:'-lastLoginTime'}).populate('users',{email:1}).toArray(function(err, emails){
// 		if(err){
// 			console.log(err);
// 		}else{
// 			console.log(JSON.stringify(emails));
// 			// sendEmailsSync(0,users);
// 		}
//
//   });
// });
