/**
 * Created by Canon on 2015-12-23.
 */
var fs = require('fs'),
    cheerio = require('cheerio'),
    util = require('util');


var SocringRule = function() {
    var scoringRule = null;
    var setScoringRule = function(rule) {
        scoringRule = rule;
    };
    var printScoringRule = function() {
        console.log(util.inspect(scoringRule, false, null));
    };

    var getNode = function() {
        return scoringRule;
    };


    return {setScoringRule: setScoringRule, printScoringRule: printScoringRule, getNode: getNode}
};


//footItems: array of foodItem
//foodItem: dict
//key of foodItem: carbs, protein, fat, fibre, sugar, saturatedFat,
//                 transFat, sodium, calories, portionSize
//var MealSchema = new Schema({
//    carb: Number,
//    fibre: Number, //not used currently
//    pro: Number,
//    fat: Number,
//    cals: Number,
//    mealType: {
//        type: String,
//        enum: ['Snack', 'Breakfast', 'Lunch', 'Supper']
//    }
//});

//nutritionFacts: (number, obj, obj) => obj
var nutritionFacts = function(userTargetCalories, foodItems, meal) {
    var mealCaloriesRatio = 0.0;
    var carbsCaloriesRatio = 0.0;
    var sugarCaloriesRatio = 0.0;
    var fatCaloriesRatio = 0.0;
    var proCaloriesRatio = 0.0;

    var transFatRatio = 0.0;
    var satureFatRatio = 0.0;
    var unhealthyFatRatio = 0.0;

    var fiberAmount = 0.0;
    var carbAmount = 0.0;
    var proAmount = 0.0;
    var fatAmount = 0.0;
    var sugarAmount = 0.0;
    var calAmount = 0.0;


    var starchAmount = 0.0;
    var saturedFatAmount = 0.0;
    var transFatAmount = 0.0;
    var sodiumAmount = 0.0;

    if(foodItems !== null) {
        foodItems.map(function(foodItem) {
            carbAmount += foodItem.carbs * foodItem.portionSize;
            proAmount += foodItem.protein * foodItem.portionSize;
            fatAmount += foodItem.fat * foodItem.portionSize;
            fiberAmount += foodItem.fibre * foodItem.portionSize;
            sugarAmount += foodItem.sugar * foodItem.portionSize;
            saturedFatAmount += foodItem.saturatedFat * foodItem.portionSize;
            transFatAmount += foodItem.transFat * foodItem.portionSize;
            sodiumAmount += foodItem.sodium * foodItem.portionSize;

            starchAmount += (foodItem.carbs - foodItem.fibre - foodItem.sugar) * foodItem.portionSize;

            calAmount += foodItem.calories * foodItem.portionSize;
        });
        mealCaloriesRatio = calAmount / userTargetCalories;
        carbsCaloriesRatio = carbAmount * 4 / calAmount;
        sugarCaloriesRatio = sugarAmount * 4 / calAmount;
        fatCaloriesRatio = fatAmount * 9 / calAmount;
        proCaloriesRatio = proAmount * 4 / calAmount;

        transFatRatio = transFatAmount * 9 / calAmount;
        satureFatRatio = saturedFatAmount * 9 / calAmount;
        unhealthyFatRatio = (transFatAmount + saturedFatAmount) / fatAmount;

    } else if(meal !== null) {
        calAmount = Number(meal.cals);
        carbAmount = Number(meal.carb);
        fatAmount = Number(meal.fat);
        proAmount = Number(meal.pro);
    }

    return {"amounts" : {"fiber": fiberAmount,
                        "sugar": sugarAmount,
                        "fat": fatAmount,
                        "pro": proAmount,
                        "cal": calAmount,
                        "carb": carbAmount,
                        "starch": starchAmount,
                        "saturedFat": saturedFatAmount,
                        "transFat": transFatAmount,
                        "sodium": sodiumAmount,
                        "netCarb": carbAmount - fiberAmount},
            "calRatios": {"cal": mealCaloriesRatio,
                            "carb": carbsCaloriesRatio,
                            "sugar": sugarCaloriesRatio,
                            "fat": fatCaloriesRatio,
                            "pro": proCaloriesRatio,
                            "saturedFat": satureFatRatio,
                            "transFat": transFatRatio,
                            "unhealthyFat": unhealthyFatRatio}
    }
};

var scoreForUserWithQuickEstimate = function(userTargetCalories, meal, scoringRule) {
    var totalScore = 100.0;
    var subScoreCaloriesMinus = 0.0;
    var subScoreCarbsMinus = 0.0;
    var subScoreFatsMinus = 0.0;
    var subScoreProteinMinus = 0.0;
    var calories = meal.cals;
    var carbs = meal.carb;
    var fats = meal.fat;
    var protein = meal.pro;
    var mealType = meal.mealType?meal.mealType:'Snack';
    var mealTypeDict = {'Snack':0, 'Breakfast':1, 'Lunch':2, 'Supper': 3};
    var mealTypeCode = mealTypeDict[mealType];
    //var recommendations = [];

    var node = scoringRule.getNode();
    var selector = ['LogMethod[logType=',0,'] Meal[mealType=',mealTypeCode,']'].join('');
    //select specific meal given logType and mealType from xml
    var mealNode = node(selector);
    var target = userTargetCalories * Number(mealNode.children().first().attr('targetRatio'));
    var nutritionList = mealNode.children();
    if(mealType == 'Snack') {
        for(var i = 0;i < nutritionList.length;i++) {
            var nutrition = nutritionList.eq(i);
            var subTargetRatio = Number(nutrition.attr("subTargetRatio"));
            var ideal = target * subTargetRatio;
            var scoreP = Number(nutrition.text());
            if (nutrition.attr("name") == "Calories") {
                //Calories
                subScoreCaloriesMinus = (Math.abs(calories - ideal) / ideal) * scoreP;
                if (subScoreCaloriesMinus > scoreP) {
                    subScoreCaloriesMinus = scoreP;
                }
            }
        }

    } else {
        for(var i = 0;i < nutritionList.length;i++) {
            var nutrition = nutritionList.eq(i);
            var subTargetRatio = Number(nutrition.attr("subTargetRatio"));

            var calsPerUnit = Number(nutrition.attr("calsPerUnit"));
            var ideal = target * subTargetRatio;
            var scoreP = Number(nutrition.text());

            var nutritionName = nutrition.attr("name");
            if (nutritionName == "Carbs") {
                //Carbs
                subScoreCarbsMinus = (Math.abs(carbs * calsPerUnit - ideal) / ideal) * scoreP;

                if (subScoreCarbsMinus > scoreP) {
                    subScoreCarbsMinus = scoreP;
                }
            }
            else if (nutritionName == "Fats") {
                //Fats
                subScoreFatsMinus = (Math.abs(fats * calsPerUnit - ideal) / ideal) * scoreP;
                if (subScoreFatsMinus > scoreP) {
                    subScoreFatsMinus = scoreP;
                }
            }
            else if (nutritionName == "Protein") {
                //Protein
                subScoreProteinMinus = (Math.abs(protein * calsPerUnit - ideal) / ideal) * scoreP;
                if (subScoreProteinMinus > scoreP) {
                    subScoreProteinMinus = scoreP;
                }
            }
            else
                continue;
        }
    }

    totalScore -= subScoreCaloriesMinus + subScoreCarbsMinus + subScoreFatsMinus + subScoreProteinMinus;
    //nutritionFactsDict = nutritionFacts(userTargetCalories, null, meal);
    return totalScore;

};

//var calculateMealScore = function(meal, targetCalories, callback) {
//    var rule = SocringRule();
//    fs.readFile("MacroNutrientEstimation.xml", function(err, data) {
//        var json = cheerio.load(data, {xmlMode: true});
//        rule.setScoringRule(cheerio.load(data, {xmlMode: true}));
//        var score = scoreForUserWithQuickEstimate(targetCalories, meal, rule);
//        score = Math.round(score);
//        callback(score);
//    });
//
//};

var rule = SocringRule();

exports.init = function(cb) {
	console.log(__dirname);
    fs.readFile(__dirname + "/MacroNutrientEstimation.xml", function(err, data) {
		if(err) {
			console.log(err);
		} else {
			rule.setScoringRule(cheerio.load(data, {xmlMode: true}));
			cb();
		}
    });
};



exports.getScore = function(idealCals, meal) {
    var score = scoreForUserWithQuickEstimate(idealCals, meal, rule);
    score = Math.round(score);
    return score;
};





