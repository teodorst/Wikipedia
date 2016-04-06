var WikipediaStore			= require('../stores/WikipediaStore.js')();
var WikipediaService = {};


// parametrii sunt in ordinea cautarii;
WikipediaService.getData = function(day, year, category, keyword) {
	console.log(WikipediaStore);
	console.log(category);
	console.log(keyword);
	if (category) {
		return WikipediaStore.findInCategory(category, day, year, keyword);
	} else {
		return WikipediaStore.findAll(day, year, keyword);
	}
}

module.exports = WikipediaService;
