var mongoose = require('mongoose');

process.chdir(__dirname);

mongoose.connect('mongodb://localhost:27017/rawdata');
var sendRequest = require('../util/sendRequest');
var loginCtrl = require('../controllers/login.server.controller');
//logging
var assert = require('assert');
var path = require('path');
var KConditionCtrl = require('../controllers/knowledgecondition.server.controller');
var CFunciton = require('../controllers/conditionfunction.server.controller');
var TopicCtrl = require('../controllers/topics.server.controller');
var KnowledgeCtrl = require('../controllers/knowledge.server.controller');
var ProfileCtrl = require('../controllers/profiles.server.controller');
var count = 0;
var conditionPath = '../conditions'

// ProfileCtrl.login();
// CFunciton.initialConditionFunctions(function(err, cf){
//   if(err){
//     console.err(err);
//   }else{
//     console.log(cf);
//   }
// });

var MAX_VALUES = 10
var DEC_RATIO = 0.5;
var MAX_TIMES = 20;
var values = [];
var indexes = [];
for(var i = 0; i<MAX_VALUES;i++){
  var value = Math.round(Math.random()*100)%5+1;
  values.push(value);
  indexes.push(i);
  // console.log(value);
}
var sum = values.reduce(function(a, b) { return a + b; });
console.log("Total: "+sum);

for(var count = 0; count < MAX_TIMES; count++){
  console.log("######################");
  var pick_count =  Math.round(Math.random()*MAX_VALUES);
  var picked_values = [];
  var picked_indexes = [];

  indexes.sort( function() { return 0.5 - Math.random() } );

  for(var i = 0; i<pick_count; i++){
    var index = indexes[i];
    picked_values.push(values[index]);
    picked_indexes.push(index);
  }

  var max_value = Math.max.apply(null,picked_values);
  var max_indexes = [];
  for(var i = 0; i<picked_values.length;i++){
    if(picked_values[i]===max_value){
      max_indexes.push(picked_indexes[i]);
    }
  }

  var random_pick =  Math.round(Math.random()*max_indexes.length) % max_indexes.length;
  var picked_index = max_indexes[random_pick];
  console.log("selected value index: "+picked_index);
  console.log("selected value: "+values[picked_index]);

  var decrease_part = values[picked_index]*(1 - DEC_RATIO);
  values[picked_index] = values[picked_index] - decrease_part;
  // console.log("Decreased value: "+decrease_part);
  // console.log("selected value after decrease: "+values[picked_index]);
  // console.log("selected max values length: "+max_indexes.length);
  // console.log("selected values length: "+picked_indexes.length);

  if(picked_indexes.length > 1){
    var add_part = 1.0*decrease_part/(picked_indexes.length - 1);
    // console.log("Added value: "+add_part);
    for(var i = 0; i<picked_indexes.length;i++){
      var index = picked_indexes[i];
      if(index!=picked_index){
        values[index] = values[index]+add_part;
      }
    }
  }else{
    var add_part = 1.0*decrease_part/(values.length - 1);
    // console.log("Added value: "+add_part);
    for(var i = 0; i<values.length;i++){
      // var index = indexes[i];
      if(i!=picked_index){
        values[i] = values[i]+add_part;
      }
    }
  }

  var new_sum = values.reduce(function(a, b) { return a + b; });
  console.log("Sum: "+ new_sum + " Count: " + count);
}


// var knowledgecondition = {
//   knowledgeId : mongoose.Types.ObjectId("55889d5d706bf169b802e790"),
//   conditions : [
//     mongoose.Types.ObjectId("5751ca809c268d810a4c80c7"),
//     mongoose.Types.ObjectId("5751ca809c268d810a4c80c6"),
//     mongoose.Types.ObjectId("5751ca809c268d810a4c80c5")
//   ]
// };

// KConditionCtrl.create(knowledgecondition, function(err, kcondition){
//   if(err){
//     console.err(err);
//   }else{
//     console.log(kcondition);
//   }
// });



KConditionCtrl.checkConditions({userID:mongoose.Types.ObjectId('559e942c1026a1ca40a289d0')}, function(err, kconditions){
  if(err){
    console.err(err);
  }else{
    console.log(kconditions);
  }
});

// var fs = require('fs');
// fs.realpath(path.join(__dirname,conditionPath), function(err, path) {
//   if (err) {
//       console.log(err);
//    return;
//   }
//   console.log('Path is : ' + path);
// });
// fs.readdir(path.join(__dirname,conditionPath), function(err, files) {
//   if (err) return;
//   files.forEach(function(f) {
//       console.log('Files: ' + f);
//   });
// });
