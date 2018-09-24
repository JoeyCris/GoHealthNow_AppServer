exports.calActivityScore = function(count, dayDiff) {
	return Math.floor(100 / (1 + Math.exp(-count / dayDiff / 4)));
};
