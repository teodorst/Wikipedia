var bot 							= require('nodemw');
var WikipediaModels 	= require('../models/WikipediaModels.js');
var categories = ["Events", "Births", "Deaths", "Holidaysandobservances"];

var months = [
	{
		monthName: 'January',
		monthDaysNumber: 31,
	},
	{
		monthName: 'February',
		monthDaysNumber: 29,
	},
	{
		monthName: 'March',
		monthDaysNumber: 31,
	},
	{
		monthName: 'April',
		monthDaysNumber: 30,
	},
	{
		monthName: 'May',
		monthDaysNumber: 31,
	},
	{
		monthName: 'June',
		monthDaysNumber: 30,
	},
	{
		monthName: 'July',
		monthDaysNumber: 31,
	},
	{
		monthName: 'August',
		monthDaysNumber: 31,
	},
	{
		monthName: 'September',
		monthDaysNumber: 30,
	},
	{
		monthName: 'October',
		monthDaysNumber: 31,
	},
	{
		monthName: 'November',
		monthDaysNumber: 30,
	},
	{
		monthName: 'December',
		monthDaysNumber: 31,
	}
];

var getAllPages = function(client) {
	var day;
	for (var index in months) {
		for (day = 0; day < months[index].monthDaysNumber; day ++) {
			client.getArticle(
				months[index].monthName + '_' + day,
				function(err, data) {
			    // error handling
			    if (err) {
			      console.error(err);
			      return err;
			    }
					processResponse(data);
				}
			);
		}
	}
}

var processResponse = function(text) {
	textLines = text.split('\n');
	console.log(textLines);
	for (var lineIndex in textLines) {
			parseLine(textLines[lineIndex]);
			//console.log(textLines[lineIndex]);
	}
}



var parseLine = function(line) {
	var linkYear = '(\\s*\\[\\[[0-9]+\\]\\]\\s*)';
	var year = '(\\s*[0-9]+\\s*)';
	var linkWord = '\\s*(\\[\\[[a-zA-Z0-9\\s]+\\]\\],*\\s*)*';
	var word = '\\s*[a-zA-Z0-9\\,\\s\\(\\)\\.!\\?]+\\s*';
	var holidayLinkWord = '\\s*\\(*\\[\\[[a-zA-Z0-9\'"\\|\\,\\.\\?\\s\\)\\(]+\\]\\]\\s*\\(*\\s*';
	var categoryRegexPattern = new RegExp('==(' + word + ')==');
	var entryRegexPattern = new RegExp('\\*('+ linkYear + '|' + year + ')&ndash;'
		+ '(' + linkWord + '|' + word + ')+');
	var holidayRegexPattern = new RegExp('(\\*+)(' + holidayLinkWord +  '|' + word
	+ ')+');
	var extraLinkDescrition = new RegExp('\\[[^\\]]+\\|','ig');
	var bracketsRemove = new RegExp('[\\[\\]\\*]+','ig');

	var currentCategory;
	var holidayCategory;
	var matches = categoryRegexPattern.exec(line);


	var lastItem;
	// it might be a category
	if (matches) {
		console.log("Category:", line, matches);
		if (categories.indexOf(matches[1]) > -1) {
			console.log("New Category:", matches[1]);
			currentCategory = matches[1].replace(' ', '');
			console.log(line);
		}
	} else {
		// it might be a category entry
		matches = entryRegexPattern.exec(line);
		if (matches !== null) {
			line = line.replace(extraLinkDescrition,'[[').replace(bracketsRemove, '')
			.replace('&ndash; ', ''); // asta sau ma uit la regex
 			console.log("Entry: ", line);

		} else {
			// it might be a Holidays and Observances entry
			matches = holidayRegexPattern.exec(line);
			if (matches) {

				//console.log("MATCH", matches);
				//line = line.replace(extraLinkDescrition,'[[').replace(bracketsRemove, '');
			}
		}
	}
}

module.exports = function() {
	var client = new bot({
    server: 'en.wikipedia.org',  // host name of MediaWiki-powered site
    path: '/w',                  // path to api.php script
    debug: true                 // is more verbose when set to true
  });
	//getAllPages(client);
	client.getArticle('March_13', function(err, data) {
    // error handling
    if (err) {
      console.error(err);
      return err;
    }
		processResponse(data);

	});



	// client.getArticleCategories('March_13', function(err, data) {
	//   if (err) {
	//     console.error(err);
	//     return err;
	//   }
	// 	console.log(data);
	// })

};
