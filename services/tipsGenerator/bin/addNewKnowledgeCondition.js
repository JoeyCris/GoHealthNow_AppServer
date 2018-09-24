var mongoose = require('mongoose');

process.chdir(__dirname);

mongoose.connect('mongodb://localhost:27017/rawdata');
require('../models/knowledgebase');
var sendRequest = require('../util/sendRequest');
var loginCtrl = require('../controllers/login.server.controller');
var Knowledge = mongoose.model('Knowledge');
//logging
var assert = require('assert');
var path = require('path');
var KConditionCtrl = require('../controllers/knowledgecondition.server.controller');
var CFunciton = require('../controllers/conditionfunction.server.controller');
var TopicCtrl = require('../controllers/topics.server.controller');
var KnowledgeCtrl = require('../controllers/knowledgelocal.server.controller');
var ProfileCtrl = require('../controllers/profiles.server.controller');
var count = 0;
var conditionPath = '../conditions'



// var knowledge = {
//   title: "",
//   content: "",
//   media: [{}],
//   priority: 3
// }

// var knowledges = [
// { "_id" : mongoose.Types.ObjectId("56afd524bdbac76d4a4ec09b"), "type" : "other", "medias" : [ { "uri" : "images/knowledge/1354770163.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("56afd664bdbac76d4a4ec0a4") } ], "content" : "Hey! Personalize your profile with your age, gender, height, and so on, to receive personalized meal score and feedback just for you! Simply go to Menu (top left) and Profile to update.", "title" : "ProfileDefaultOne", "__v" : 1, "link" : "local://edit_profile", "send_email" : false, "send_push" : false }
// ,{ "_id" : mongoose.Types.ObjectId("56c4d8271aece8437cc26f1b"), "type" : "tip", "medias" : [ { "uri" : "images/knowledge/helpfive.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("56c4d8271aece8437cc26f1c") } ], "content" : "Did you know, GlucoGuide has the Patent-pending feature called Reminder with 1-click Log? That means you can just click \"Take & Log\" when the set reminder pops up, and the repeated event is logged automatically!", "title" : "HelpFive", "__v" : 0, "send_email" : false, "send_push" : false }
// ,{ "_id" : mongoose.Types.ObjectId("56c4de1c1aece8437cc26f41"), "type" : "tip", "link" : "https://glucoguide.com/ICDMW2014.pdf", "medias" : [ { "uri" : "images/knowledge/helpsix.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("56c4de1c1aece8437cc26f42") } ], "content" : "GlucoGuide is an evidence-based guide to improve your diabetes, and meet your A1c target. This has been demonstrated in a clinical trial conducted at Western University. See here for our peer-reviewed paper.", "title" : "HelpSix", "__v" : 0, "send_email" : false, "send_push" : false }
// ,{ "_id" : mongoose.Types.ObjectId("56d0b1607a997200341edd3d"), "type" : "other", "link" : "local://add_reminder_medication", "send_email" : false, "send_push" : false, "medias" : [ { "uri" : "images/knowledge/help_seven.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("56d0e9c77a997200341ede98") } ], "content" : "Need a reminder to take your medication? Set up reminder here! Setting reminder helps you log your medication in one click!", "title" : "NoReminderOne", "__v" : 1 }
// ,{ "_id" : mongoose.Types.ObjectId("56d49d807a997200341f1949"), "type" : "tip", "link" : "http://www.diabetes.ca/diabetes-and-you/healthy-living-resources/exercise/overcoming-barriers-to-physical-activity", "send_email" : false, "send_push" : false, "medias" : [ { "uri" : "images/knowledge/healthtwo.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("56d4a47d7a997200341f1963") } ], "content" : "Always carry a form of quick-acting sugar on you (like candy!) when you exercise to prevent low blood sugar.", "title" : "HealthTwo", "__v" : 1 }
// ,{ "_id" : mongoose.Types.ObjectId("56d49d9d7a997200341f194a"), "type" : "tip", "send_email" : false, "send_push" : false, "medias" : [ { "uri" : "images/knowledge/healththree.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("56d4a4a27a997200341f1964") } ], "content" : "Go for a walk or do some physical activity 1-2 hours after your meal, when your blood sugar is highest, to use up the blood sugar as energy!", "title" : "HealthThree", "__v" : 1 }
// ,{ "_id" : mongoose.Types.ObjectId("56afd559bdbac76d4a4ec09c"), "type" : "tip", "medias" : [ { "uri" : "images/knowledge/help2.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("56afd7aebdbac76d4a4ec0a9") } ], "content" : "Food recognition is very hard, but we are working harder to improve it :) Please do not forget to check top-5 predictions. \nIf we cannot recognize your food, your photos may still be used to improve our computer models. So thank-you for helping us learn and improve our models that meet your need.", "title" : "HelpTwo", "__v" : 1, "send_email" : false, "send_push" : false }
// ,{ "_id" : mongoose.Types.ObjectId("56afd57bbdbac76d4a4ec09d"), "type" : "tip", "medias" : [ { "uri" : "images/knowledge/help3.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("56affe7fbdbac76d4a4ec54c") } ], "content" : "Use GlucoGuide as a personalized \"Guide\" to help you learn to better manage your diabetes. Your effort will pay off as you continue to use GlucoGuide to help you manage diabetes daily. Many of our users have learned to manage their diabetes so well, they even reduced their medications while maintaining the same or lower A1c. You can get there too!", "title" : "HelpThree", "__v" : 1, "send_email" : false, "send_push" : false }
// ,{ "_id" : mongoose.Types.ObjectId("56afd59fbdbac76d4a4ec09f"), "type" : "tip", "medias" : [ { "uri" : "images/knowledge/help4.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("56b00ab4bdbac76d4a4ec5d4") } ], "content" : "With diabetes, eating a balanced diet at EVERY meal is more important than just meeting your daily calorie requirement. We have a unique feature called Meal Score. Review your personalized meal score, and try to improve it over days and weeks. 100 is the BEST (meaning your meal matches perfectly the CDA and Health Canada Guidelines with your Profile).", "title" : "HelpFour", "__v" : 1, "send_email" : false, "send_push" : false }
// ,{ "_id" : mongoose.Types.ObjectId("56c4ed601aece8437cc26f72"), "type" : "tip", "link" : "http://www.diabetes.ca/diabetes-and-you/healthy-living-resources/heart-health/how-to-lower-your-blood-pressure", "medias" : [ { "uri" : "images/knowledge/health_one.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("56ce497ec340f5e58adfbf08") } ], "content" : "Monitor your blood pressure regularly to make sure it is under control, at 130/80 mmHg or less. Smoking, alcohol, stress, and diet can affect your blood pressure. Exercise, healthy eating, and proper medication can help lower your blood pressure.Talk to your doctor if you have high blood pressure.", "title" : "HealthOne", "__v" : 2, "send_email" : false, "send_push" : false }
// ,{ "_id" : mongoose.Types.ObjectId("56d9e2877a997200341f7252"), "type" : "tip", "link" : "", "send_email" : false, "send_push" : false, "medias" : [ { "uri" : "images/knowledge/health4.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("56d9eb497a997200341f72dd") } ], "content" : "Do you know diabetes is a slow and silent \"killer\"?  It can lead to amputation, blindness, heart attack, and so on.  The good news is if you manage your blood sugar well with GlucoGuide, you can delay or even prevent these dangerous complications!", "title" : "HealthFour", "__v" : 3 }
// ,{ "_id" : mongoose.Types.ObjectId("576abfae081ad20c5cdca358"), "type" : "tip", "link" : "http://www.diabetes.ca/diabetes-and-you/healthy-living-resources/exercise/overcoming-barriers-to-physical-activity", "send_email" : false, "send_push" : false, "medias" : [ { "uri" : "images/knowledge/healthfive.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("576abfae081ad20c5cdca359") } ], "content" : "Every minute counts! You don't have to exercise for a long time to gain benefits; break down your physical activity into short, 10-minute chunks throughout the day.", "title" : "HealthFive", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("576ac0e8081ad20c5cdca362"), "type" : "tip", "link" : "http://www.diabetes.ca/diabetes-and-you/healthy-living-resources/exercise/introduction-to-resistance-exercise", "send_email" : false, "send_push" : false, "medias" : [ { "uri" : "images/knowledge/healthSix.jpeg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("576ac0e8081ad20c5cdca363") } ], "content" : "Resistance exercise helps you gain lean muscle by improving your strength and flexibility; try resistance exercises using your own body weight, light hand weights, yoga, and exercise bands.", "title" : "HealthSix", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("576ac165081ad20c5cdca365"), "type" : "tip", "link" : "http://www.diabetes.ca/diabetes-and-you/healthy-living-resources/exercise/physical-activity-diabetes", "send_email" : false, "send_push" : false, "medias" : [ { "uri" : "images/knowledge/healthseven.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("576ac165081ad20c5cdca366") } ], "content" : "Safety first! Listen to your body and talk to your healthcare provider if you experience shortness of breath or chest pain while exercising. Consult your doctor before you try any new activities.", "title" : "HealthSeven", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("576ac6ce081ad20c5cdca37c"), "type" : "tip", "send_email" : false, "send_push" : false, "medias" : [ { "uri" : "images/knowledge/healtheight.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("576ac6ce081ad20c5cdca37d") } ], "content" : "To maintain physical activity, it's important to do something you enjoy. Try active hobbies such as sports, dancing, biking to work, or gardening.", "title" : "HealthEight", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("576ac796081ad20c5cdca384"), "type" : "tip", "link" : "http://www.diabetes.ca/diabetes-and-you/healthy-living-resources/diet-nutrition/top-10-tips-for-tasty-healthy-meals", "send_email" : false, "send_push" : false, "medias" : [ { "uri" : "images/knowledge/healthnine.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("576ac796081ad20c5cdca385") } ], "content" : "Pick vegetables that are different, bright colours to increase the variety of beneficial vitamins, minerals and antioxidants in your diet.", "title" : "HealthNine", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("576ac82c081ad20c5cdca388"), "type" : "tip", "link" : "http://www.diabetes.ca/diabetes-and-you/healthy-living-resources/diet-nutrition/top-10-tips-for-tasty-healthy-meals", "send_email" : false, "send_push" : false, "medias" : [ { "uri" : "images/knowledge/healthten.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("576ac82c081ad20c5cdca389") } ], "content" : "Foods can be both healthy and tasty! Flavour your food with delicious spices and herbs; limit butter, salt, and sugar in your cooking.", "title" : "HealthTen", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("576ac8b8081ad20c5cdca397"), "type" : "tip", "send_email" : false, "send_push" : false, "medias" : [ { "uri" : "images/knowledge/healtheleven.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("576ac8b8081ad20c5cdca398") } ], "content" : "Some reduced-fat products use sugars and starches as substitutes. Be sure to check the nutrition label for sugar content and ingredients.", "title" : "HealthEleven", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("576ace28081ad20c5cdca3aa"), "type" : "tip", "send_email" : false, "send_push" : false, "medias" : [ { "uri" : "images/knowledge/healthtwelve.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("576ace28081ad20c5cdca3ab") } ], "content" : "To reduce fat in your diet: try plant-based proteins like beans and tofu, steam or bake your food instead of frying, trim off the fat from your meat and skim the fat from the broth.", "title" : "HealthTwelve", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("576acf1a081ad20c5cdca3af"), "type" : "tip", "send_email" : false, "send_push" : false, "medias" : [ { "uri" : "images/knowledge/healththirteen.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("576acf1a081ad20c5cdca3b0") } ], "content" : "Skim milk and partly-skimmed milk both contain the same level of nutrients as whole milk, minus the fat content!", "title" : "HealthThirteen", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("576acfc2081ad20c5cdca3b2"), "type" : "tip", "send_email" : false, "send_push" : false, "medias" : [ { "uri" : "images/knowledge/healthfourteen.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("576acfc2081ad20c5cdca3b3") } ], "content" : "Quench your thirst with water! Make your calories count and avoid empty calories (without nutrients) from soft drinks, lattes, and slushies.", "title" : "HealthFourteen", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("576ad06b081ad20c5cdca3b6"), "type" : "tip", "link" : "http://www.diabetes.ca/diabetes-and-you/healthy-living-resources/diet-nutrition/fibre", "send_email" : false, "send_push" : false, "medias" : [ { "uri" : "images/knowledge/healthfifteen.jpg", "mimeType" : "image/jpeg", "_id" : mongoose.Types.ObjectId("576ad06b081ad20c5cdca3b7") } ], "content" : "Fibre helps with your blood sugar, cholesterol, weight and blood pressure. To add more fibre to your diet: eat fruits with the skin, eat more whole grain products, add nuts and seeds to your diet, and eat more plant based protein like legumes.", "title" : "HealthFifteen", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("576b04a9081ad20c5cdca4c3"), "type" : "other", "send_email" : false, "send_push" : false, "medias" : [ ], "content" : "We noticed you have been using GlucoGuide for more than a week! Great job for being an active self-manager of your health. Learn from our personalized feedback and apply it to your daily life!", "title" : "ActiveOne", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("576b0509081ad20c5cdca4c7"), "type" : "other", "send_email" : false, "send_push" : false, "medias" : [ ], "content" : "Hey there! You haven't used GlucoGuide for at least 7 days and we miss you. Take a few minutes to log your progress now and see immediate feedback! Some of our regular users improved their health dramatically!", "title" : "InactiveOne", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("576b0540081ad20c5cdca4c8"), "type" : "other", "send_email" : false, "send_push" : false, "medias" : [ ], "content" : "Your profile is still set at the default values (male, born in 1975, ...). Personalize your profile with your age, gender, height, and so on, to receive personalized feedback just for you! Simply go to Menu (top left) and Profile to update.", "title" : "ProfileDefault", "__v" : 0, "link" : "local://edit_profile" }
// ,{ "_id" : mongoose.Types.ObjectId("576b0561081ad20c5cdca4c9"), "type" : "other", "send_email" : false, "send_push" : false, "medias" : [ ], "content" : "Need a reminder to take your medication, blood glucose, or exercise? Set up a reminder here! When it is time, the App will \"ding\" you; it is like your personal secretary!", "title" : "NoReminder", "__v" : 0, "link" : "local://add_reminder_medication" }
// ,{ "_id" : mongoose.Types.ObjectId("576b08e2081ad20c5cdca4d5"), "type" : "other", "send_email" : false, "send_push" : false, "medias" : [ ], "content" : "We noticed you have been using GlucoGuide for at least 7 days in a row! Great job for being an active self-manager of your health. Learn from our personalized feedback and apply it to your daily life!", "title" : "ActiveTwo", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("576b0933081ad20c5cdca4d7"), "type" : "other", "send_email" : false, "send_push" : false, "medias" : [ ], "content" : "Hey there! You haven't used GlucoGuide for more than a week and we miss you. Take a few minutes to log your progress now and see immediate feedback! Some of our regular users improved their health dramatically!", "title" : "InactiveTwo", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("577582fad383e7951f1bb63d"), "type" : "report", "priority" : 5, "send_email" : true, "send_push" : false, "medias" : [ ], "content" : "Your weekly Personal Report: You earned a total of $total_points$ points! \n$meal_points$ points came from your meal/diet, $exercise_points$ point came from your exercise. \nTips for improving your points for next week: \n1. Log meals more often, and try to achieve higher scores for healthier diet. \n2. Carry your phone in your pants pocket to walk/jog, and be more active!", "title" : "WeeklySummary", "__v" : 0, "replace_parts" : [ { "keyword" : "meal_points", "reference" : "weekly_meal_points" }, { "keyword" : "total_points", "reference" : "weekly_total_points" }, { "keyword" : "exercise_points", "reference" : "weekly_exercise_points" } ] }
// ,{ "_id" : mongoose.Types.ObjectId("579fffcbcbd5f76d731bc4de"), "type" : "other", "replace_parts" : [ { "keyword" : "", "reference" : "", "_id" : mongoose.Types.ObjectId("579fffcbcbd5f76d731bc4df") } ], "priority" : 3, "send_email" : false, "send_push" : true, "medias" : [ ], "content" : "Your meal score needs some improvement. Click on nutrition details to see how you can improve.", "title" : "MealOne", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("57a00053cbd5f76d731bc4e1"), "type" : "other", "replace_parts" : [ { "keyword" : "", "reference" : "", "_id" : mongoose.Types.ObjectId("57a00053cbd5f76d731bc4e2") } ], "priority" : 3, "send_email" : false, "send_push" : true, "medias" : [ ], "content" : "You recent meal score was quite low. Feel free to use the \"Ask Expert\" feature to consult our health team on ways to improve.", "title" : "MealTwo", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("57a0007ccbd5f76d731bc4e4"), "type" : "other", "replace_parts" : [ { "keyword" : "", "reference" : "", "_id" : mongoose.Types.ObjectId("57a0007ccbd5f76d731bc4e5") } ], "priority" : 3, "send_email" : false, "send_push" : true, "medias" : [ ], "content" : "Your recent meal score seems low. Check your profile to make sure you have entered your personal information (height, weight, age, gender) correctly.", "title" : "MealThree", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("57a00102cbd5f76d731bc4e7"), "type" : "other", "replace_parts" : [ { "keyword" : "", "reference" : "", "_id" : mongoose.Types.ObjectId("57a00102cbd5f76d731bc4e8") } ], "priority" : 3, "send_email" : false, "send_push" : true, "medias" : [ ], "content" : "Your meal score seems low. Be sure to log your whole meal and not just part of a meal.", "title" : "MealFour", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("57a0011bcbd5f76d731bc4ea"), "type" : "other", "replace_parts" : [ { "keyword" : "", "reference" : "", "_id" : mongoose.Types.ObjectId("57a0011bcbd5f76d731bc4eb") } ], "priority" : 3, "send_email" : false, "send_push" : true, "medias" : [ ], "content" : "Your meal score seems low. You can adjust the calorie distribution of your meal according to your usual eating habits. Click here to adjust calorie distribution.", "title" : "MealFive", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("57a001f2cbd5f76d731bc4ed"), "type" : "other", "replace_parts" : [ { "keyword" : "MealScore", "reference" : "mealScore", "_id" : mongoose.Types.ObjectId("57a001f2cbd5f76d731bc4ef") }, { "keyword" : "", "reference" : "", "_id" : mongoose.Types.ObjectId("57a001f2cbd5f76d731bc4ee") } ], "priority" : 3, "send_email" : false, "send_push" : true, "medias" : [ ], "content" : "Excellent! Your meal score was $MealScore$. Congratulations!", "title" : "MealSix", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("57a0024ecbd5f76d731bc4f1"), "type" : "other", "replace_parts" : [ { "keyword" : "", "reference" : "", "_id" : mongoose.Types.ObjectId("57a0024ecbd5f76d731bc4f2") } ], "priority" : 3, "send_email" : false, "send_push" : true, "medias" : [ ], "content" : "Your meal scores are looking good but can be improved. See nutrition details to learn how.", "title" : "MealSeven", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("57a00e20cbd5f76d731bc4f4"), "type" : "other", "replace_parts" : [ { "keyword" : "", "reference" : "", "_id" : mongoose.Types.ObjectId("57a00e20cbd5f76d731bc4f5") } ], "priority" : 3, "send_email" : false, "send_push" : true, "medias" : [ ], "content" : "Your food data shows that you're eating too much carbohydrate. Try cutting down on sweets, bread, rice, pasta, or potatoes.", "title" : "NutritionOne", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("57a00f29cbd5f76d731bc4f7"), "type" : "other", "link" : "https://www.youtube.com/channel/UCnL7tFkxfcnwh5UY7-__dVQ", "replace_parts" : [ { "keyword" : "", "reference" : "", "_id" : mongoose.Types.ObjectId("57a00f29cbd5f76d731bc4f8") } ], "priority" : 3, "send_email" : false, "send_push" : true, "medias" : [ ], "content" : "Your step count indicates 0 steps. Have you turned on your GlucoGuide's pedometer and put the phone in your pants pocket when you walk or jog? Watch the how-to video to learn how!", "title" : "StepCountOne", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("57a00f62cbd5f76d731bc4fa"), "type" : "other", "replace_parts" : [ { "keyword" : "", "reference" : "", "_id" : mongoose.Types.ObjectId("57a00f62cbd5f76d731bc4fb") } ], "priority" : 3, "send_email" : false, "send_push" : true, "medias" : [ ], "content" : "Your step count seems quite low for today. Carry your phone in your purse or pocket when you go for a walk to track your activity, and become more active to stay healthy!", "title" : "StepCountTwo", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("57a01384cbd5f76d731bc4fd"), "type" : "other", "replace_parts" : [ { "keyword" : "StepCount", "reference" : "stepCount", "_id" : mongoose.Types.ObjectId("57a01384cbd5f76d731bc501") }, { "keyword" : "StepCountGoal", "reference" : "stepCountGoal", "_id" : mongoose.Types.ObjectId("57a01384cbd5f76d731bc500") }, { "keyword" : "LastName", "reference" : "lastName", "_id" : mongoose.Types.ObjectId("57a01384cbd5f76d731bc4ff") }, { "keyword" : "", "reference" : "", "_id" : mongoose.Types.ObjectId("57a01384cbd5f76d731bc4fe") } ], "priority" : 3, "send_email" : false, "send_push" : true, "medias" : [ ], "content" : "Good job on walking $StepCount$ steps today.  Would you like to increase your goal to $StepCountGoal$? Click to adjust your goal. You can do it $LastName$!", "title" : "StepCountThree", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("57a015c6cbd5f76d731bc506"), "type" : "other", "replace_parts" : [ { "keyword" : "", "reference" : "", "_id" : mongoose.Types.ObjectId("57a015c6cbd5f76d731bc507") } ], "priority" : 3, "send_email" : false, "send_push" : true, "medias" : [ ], "content" : "Your BMI is within the \"Obese\" range. Losing only 5% of your weight can already benefit your overall health and prevent further serious health issues. Consult with a healthcare provider regarding your weightloss goal and how to achieve healthy weight management.", "title" : "BMITwo", "__v" : 0 }
// ,{ "_id" : mongoose.Types.ObjectId("57a013becbd5f76d731bc503"), "type" : "other", "replace_parts" : [ ], "priority" : 3, "send_email" : false, "send_push" : true, "medias" : [ ], "content" : "Your BMI in within the \"Overweight\" range. You should be mindful of weight management to prevent serious chronic health issues such as metabolic syndrome, heart disease, high blood pressure, uncontrolled blood glucose. Refer to this resource for tips on health weight management.", "title" : "BMIOne", "__v" : 1 }
// ,{ "_id" : mongoose.Types.ObjectId("57a01619cbd5f76d731bc509"), "type" : "other", "replace_parts" : [ { "keyword" : "", "reference" : "", "_id" : mongoose.Types.ObjectId("57a01619cbd5f76d731bc50a") } ], "priority" : 3, "send_email" : false, "send_push" : true, "medias" : [ ], "content" : "For an individual of your age range, start with a step count goal of about 3000 - 4000 steps a day. If you feel comfortable, increase your goal by 1000 steps.", "title" : "StepCountFour", "__v" : 0 }
// ]
var knowledges = [];
// console.log(knowledges);
// knowledges.forEach(function(ele,idx,arr){
//   console.log(ele);
// });
// /*
Knowledge.find().exec(function(err,knowledges){
  CFunciton.initialConditionFunctions(function(err, cf){
    if(err){
      console.err(err);
    }else{
      // console.log(cf);
      // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      CFunciton.listID(function(err,ids){
        // console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        knowledges.forEach(function(ele,idx,arr){
          var knowledge = ele;
          console.log(knowledge.title);
          if(knowledge.title.lastIndexOf('Overweight') == 0 ||
              knowledge.title.lastIndexOf('DMOrPreDM') == 0 ||
              knowledge.title.lastIndexOf('HighBloodPressure') == 0 ||
              knowledge.title.lastIndexOf('Aboriginal') == 0 ||
              knowledge.title.lastIndexOf('Asian') == 0 ||
              knowledge.title.lastIndexOf('AfricanAmerican') == 0 ||
              knowledge.title.lastIndexOf('Latino') == 0 ||
              knowledge.title.lastIndexOf('Caucasian') == 0 ){
                knowledge.type = 'tip';
              }
          KnowledgeCtrl.update(knowledge,function(err){
            if(err){
              console.error(err);
            }
          });

          var conditions = [];
          var knowledgecondition = {
            knowledgeId : knowledge._id,
            conditions : []
          };
          // console.log(knowledge.title);

          // if(knowledge.type === 'other'){
          //
          //   if(knowledge.title.lastIndexOf("Active", 0) === 0){
          //     knowledgecondition.conditions.push(ids["usedContinuously"])
          //   }else if(knowledge.title.lastIndexOf("Inactive", 0) === 0){
          //     knowledgecondition.conditions.push(ids["inactiveContinuously"])
          //   }else if(knowledge.title.lastIndexOf("ProfileDefault", 0) === 0){
          //     knowledgecondition.conditions.push(ids["userProfileDefault"])
          //   }else if(knowledge.title.lastIndexOf("NoReminder", 0) === 0){
          //     knowledgecondition.conditions.push(ids["noReminder"])
          //   }else{
          if(knowledge.type === 'tip'){
            conditions.push(ids["onefunction"])
          }

          //   }
          //
          KConditionCtrl.kconditionByKnowledgeId(knowledgecondition.knowledgeId,function(err, kcondition){
            if(err){
              console.error(err);
            }else{
              if(kcondition){
                conditions.forEach(function(ele){
                  var exists = false;
                  kcondition.conditions.forEach(function(ele2){
                    // knowledgecondition.conditions.push(ele2);
                    if(ele.toString() === ele2.toString()){
                      exists = true;
                    }
                  });
                  if(!exists){
                    knowledgecondition.conditions.push(ele);
                  }
                });
                kcondition.conditions.forEach(function(ele2){
                  knowledgecondition.conditions.push(ele2);
                });
              }else{
                knowledgecondition.conditions = conditions
              }
              KConditionCtrl.update(knowledgecondition, function(err, kcondition){
                if(err){
                  console.err(err);
                }else{
                  // console.log(kcondition);
                }
              });
            }
          });
        });
      });
    }
  });
});
// */



// KConditionCtrl.checkConditions({userID:mongoose.Types.ObjectId('559e942c1026a1ca40a289d0')}, function(err, kconditions){
//   if(err){
//     console.err(err);
//   }else{
//     console.log(kconditions);
//   }
// });


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
