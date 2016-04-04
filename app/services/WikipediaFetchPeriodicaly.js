var bot 							= require('nodemw');
var WikipediaStore 		= require('../stores/WikipediaStore.js');
var db 								= require('../stores/DataBase.js');

var minutes = 120, fetchInterval = minutes * 60 * 1000;

// WIkipedia connection client
var client = new bot({
	server: 'en.wikipedia.org',  // host name of MediaWiki-powered site
	path: '/w',                  // path to api.php script
	debug: false                 // is more verbose when set to true
});


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

// regex rulles to match lines
var characters = '–\\s\u00C0-\u1EF9\\w\\:\\&\|\';\.\(\),\!\-';
var linkYear = '\\s*\\[\\[[0-9\\sBC]+\\]\\]\\s*';
var year = '\\s*[0-9\\sBC]+\\s*';
var linkWord = '\\s*(['+ characters + '\\{\\}\\[\\]]+,*\\s*)*';
var word = '\\s*[' + characters + ']+\\s*';
var categoryRegexPattern = new RegExp('==(' + word + ')==');
var entryRegexPattern = new RegExp('\\*('+ linkYear + '|' + year + ')&ndash;'
	+ '(' + linkWord + '|' + word + ')+');
var holidayRegexPattern = new RegExp('(\\*+)(' + linkWord + ')+');
var extraLinkDescription = new RegExp('(\\[[^\\]]+\\|)|(\\{[^\\}]+\\|)','ig');
var bracketsRemove = new RegExp('[\\{\\}\\[\\]\\*]+','ig');
var removeWhiteSpaces = new RegExp('\\s', 'g');
var removeDash = new RegExp('&ndash', 'g');

var currentCategory = undefined;
var currentDay;

var getCurrentTime = function(){
  return new Date().getTime();
}

var getAllPages = function() {
	var time = getCurrentTime();
	currentCategory = undefined;
	var day;

	for (var index in months) {
		for (day = 1; day <= months[index].monthDaysNumber; day ++) {
			var monthDay = months[index].monthName.concat('_', day);
			client.getArticle(
				monthDay,
				function(err, data) {
			    // error handling
			    if (err) {
			      console.error(err);
			      return err;
			    }
					processResponse(data, monthDay, time);
				}
			);
		}
	}
};

var processResponse = function(text, day, time) {
	textLines = text.split('\n');
	for (var lineIndex in textLines) {
			parseLine(textLines[lineIndex], day, time);
	}
};

var parseLine = function(line, day, time) {
	var matches = categoryRegexPattern.exec(line);
	// it might be a category
	if (matches) {
		var readCategory = matches[1].replace(removeWhiteSpaces, '');
		if (categories.indexOf(readCategory) > -1) {
			currentCategory = readCategory.toLowerCase(); // another strinng
			//console.log("New Category:", currentCategory);
		} else {
			currentCategory = undefined;
		}
	} else {
		// it might be a category entry
		if (!currentCategory) {
			return;
		}
		matches = entryRegexPattern.exec(line);
		if (matches !== null && currentCategory) {
			var year = matches[1].replace(bracketsRemove, '')
				.replace(removeWhiteSpaces, '').trim();
			var title = matches[2].replace(extraLinkDescription, '[[')
				.replace(bracketsRemove, '').replace('&ndash', '-').trim();

			dbStore.insertInCategory(currentCategory, title, day, time, year)
				.catch(function(error) {
					//console.log("Insert Failed!", error);
				});

		} else {
			// it might be a Holidays and Observances entry
			matches = holidayRegexPattern.exec(line);
			if (matches !== null && currentCategory) {
				var title = matches[2].replace(extraLinkDescription, '[[')
					.replace(bracketsRemove, '').replace('&ndash', '-').trim();

				dbStore.insertInCategory(currentCategory, title, day, time)
				.catch(function(error) {
					//console.log("Insert Failed!", error);
				});
			}
		}
	}
};

if (!module.parent) {

	db.connect()
		.then(function(dbInstance) {
			dbStore = WikipediaStore(dbInstance);

			setInterval(getAllPages, fetchInterval);
		})
		.catch(function(err){
			console.log('Can\'t connect to DB! Exiting ... ');
			process.exit(127);
		});
} else {
	module.exports = function(db) {
		dbStore = WikipediaStore(db);
		//dbStore.clearCollections();
		//getAllPages();
		client.getArticle(
			'March_13',
			function(err, data) {
				// error handling
				if (err) {
					console.error(err);
					return err;
				}
				processResponse(data, 'March_13', 1243214321.00);
			}
		);

		setInterval(getAllPages, fetchInterval);
	};
}
