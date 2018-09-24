

db.exercises.find({userID:{$in: [ ObjectId("5730e4b1f485491aaff0f134"), ObjectId("56b253c36d53d4ff26849ee0"),ObjectId("56b531aec9da9e4d30eb4030"), ObjectId("568146608c4eac52bd21c143"), ObjectId("563aafb3523f66a3ae6483c2")]}}).snapshot().forEach(
function (elem) {         db.exercises.update(             {                 _id: elem._id             },             {                 
$set: {                     
recordedTime: new Date(elem.recordedTime.getTime() + 30*24*60*60000)
}             }         );     } );

db.meals.find({userID:{$in: [ ObjectId("5730e4b1f485491aaff0f134"), ObjectId("56b253c36d53d4ff26849ee0"), ObjectId("56b531aec9da9e4d30eb4030"), ObjectId("568146608c4eac52bd21c143"), ObjectId("563aafb3523f66a3ae6483c2")]}}).snapshot().forEach(
function (elem) {         db.meals.update(             {                 _id: elem._id             },             {                 
$set: {                     
recordedTime: new Date(elem.recordedTime.getTime() + 30*24*60*60000),
}             }         );     } );


db.users.update({_id:{$in: [ ObjectId("5730e4b1f485491aaff0f134"), ObjectId("56b253c36d53d4ff26849ee0"), ObjectId("56b531aec9da9e4d30eb4030"), ObjectId("568146608c4eac52bd21c143"), ObjectId("563aafb3523f66a3ae6483c2")]}},  {
$set: { retrieveTime: new Date(), lastLoginTime: new Date(), } },{ multi: true } );


db.points.find({userID:{$in: [ ObjectId("5730e4b1f485491aaff0f134"), ObjectId("56b253c36d53d4ff26849ee0"), ObjectId("56b531aec9da9e4d30eb4030"), ObjectId("568146608c4eac52bd21c143"), ObjectId("563aafb3523f66a3ae6483c2")]}}).snapshot().forEach(
function (elem) {         db.points.update(             {                 _id: elem._id             },             {
$set: {
recordedTime: new Date(elem.recordedTime.getTime() + 30*24*60*60000),
}             }         );     } );


/////
///////for demo//////

var ac = "magna";
db.users.update({_id:ObjectId("5730e4b1f485491aaff0f134")},  {
$set: { accessCode:ac  } } );

var ac = "rwam";
db.users.update({_id:ObjectId("56b253c36d53d4ff26849ee0")},  {
$set: { accessCode:ac  } } );

var ac = "rwam";
db.users.update({_id:ObjectId("56b253c36d53d4ff26849ee0")},  {
$set: { accessCode:ac  } } );

///////for demo//////

var ac = "sunlife";
db.users.update({_id:ObjectId("5730e4b1f485491aaff0f134")},  {
$set: { accessCode:ac  } } );
db.users.update({_id:ObjectId("566b3272f73f0a68248c6048")},  {
$set: { accessCode:ac,userName:ac,email:ac+"@test.com"  } } );

db.users.update({_id:ObjectId("5647e9e969707dd4bda5dbd9")},  {
$set: { accessCode:ac,userName:ac+"_c",email:ac+"_c@test.com"  } } );



///// for john doe //////////////////




////////////////


db.exercises.find({userID:ObjectId("56b253c36d53d4ff26849ee0")}).snapshot().forEach( 
function (elem) {         db.exercises.update(             {                 _id: elem._id             },             {                 
$set: {                     
recordedTime: new Date(elem.recordedTime.getTime() + 395*24*60*60000),
stepCount:    elem.calories * 23              
}             }         );     } );

db.exercises.find({userID:ObjectId("56b531aec9da9e4d30eb4030")}).snapshot().forEach( 
function (elem) {         db.exercises.update(             {                 _id: elem._id             },             {                 
$set: {                     
recordedTime: new Date(elem.recordedTime.getTime() + 395*24*60*60000),
stepCount:    elem.calories * 23              
}             }         );     } );

db.exercises.find({userID:ObjectId("568146608c4eac52bd21c143")}).snapshot().forEach( 
function (elem) {         db.exercises.update(             {                 _id: elem._id             },             {                 
$set: {                     
recordedTime: new Date(elem.recordedTime.getTime() + 395*24*60*60000),
stepCount:    elem.calories * 23              
}             }         );     } );

db.exercises.find({userID:ObjectId("563aafb3523f66a3ae6483c2")}).snapshot().forEach( 
function (elem) {         db.exercises.update(             {                 _id: elem._id             },             {                 
$set: {                     
recordedTime: new Date(elem.recordedTime.getTime() + 395*24*60*60000),
stepCount:    elem.calories * 23              
}             }         );     } );




/////////meal
db.meals.find({userID:ObjectId("56b253c36d53d4ff26849ee0")}).snapshot().forEach( 
function (elem) {         db.meals.update(             {                 _id: elem._id             },             {                 
$set: {                     
recordedTime: new Date(elem.recordedTime.getTime() + 395*24*60*60000),
}             }         );     } );

db.meals.find({userID:ObjectId("56b531aec9da9e4d30eb4030")}).snapshot().forEach( 
function (elem) {         db.meals.update(             {                 _id: elem._id             },             {                 
$set: {                     
recordedTime: new Date(elem.recordedTime.getTime() + 395*24*60*60000),
}             }         );     } );

db.meals.find({userID:ObjectId("568146608c4eac52bd21c143")}).snapshot().forEach( 
function (elem) {         db.meals.update(             {                 _id: elem._id             },             {                 
$set: {                     
recordedTime: new Date(elem.recordedTime.getTime() + 395*24*60*60000),
}             }         );     } );

db.meals.find({userID:ObjectId("563aafb3523f66a3ae6483c2")}).snapshot().forEach( 
function (elem) {         db.meals.update(             {                 _id: elem._id             },             {                 
$set: {                     
recordedTime: new Date(elem.recordedTime.getTime() + 395*24*60*60000),
}             }         );     } );

/// weekly points
db.points.find({userID:{$in: [ ObjectId("56b253c36d53d4ff26849ee0"), ObjectId("56b531aec9da9e4d30eb4030"), ObjectId("568146608c4eac52bd21c143"), ObjectId("563aafb3523f66a3ae6483c2")]}}).snapshot().forEach( 
function (elem) {         db.points.update(             {                 _id: elem._id             },             {                 
$set: {                     
recordedTime: new Date(elem.recordedTime.getTime() + 395*24*60*60000),
}             }         );     } );

////////last app use ///
db.users.find({_id:{$in: [ObjectId("563aafb3523f66a3ae6483c2"),ObjectId("56b531aec9da9e4d30eb4030")]}}).snapshot().forEach( 
function (elem) {         db.users.update(             {                 _id: elem._id             },             {                 
$set: {                     
recordedTime: new Date(elem.recordedTime.getTime() + 395*24*60*60000),
}             }         );     } );

db.users.update({_id:{$in: [ ObjectId("563aafb3523f66a3ae6483c2"), ObjectId("56b531aec9da9e4d30eb4030"), ObjectId("568146608c4eac52bd21c143"), ObjectId("563aafb3523f66a3ae6483c2")]}},             {                 
$set: {                     
retrieveTime: new Date("2017-05-17T21:14:41.870Z"),
lastLoginTime: new Date("2017-05-19T21:14:41.870Z"),
}             }         );   

db.users.update({_id:{$in: [ ObjectId("56b253c36d53d4ff26849ee0"), ObjectId("56b531aec9da9e4d30eb4030"), ObjectId("568146608c4eac52bd21c143"), ObjectId("563aafb3523f66a3ae6483c2")]}},             { $set: {                      retrieveTime: new Date("2017-05-17T21:14:41.870Z"), lastLoginTime: new Date("2017-05-19T21:14:41.870Z"), }             },{ multi: true }         );


56b253c36d53d4ff26849ee0
56b531aec9da9e4d30eb4030
568146608c4eac52bd21c143
563aafb3523f66a3ae6483c2


