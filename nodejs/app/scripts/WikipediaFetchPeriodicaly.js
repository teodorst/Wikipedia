var bot 							= require('nodemw');
var WikipediaStore 		= require('../stores/WikipediaStore.js');
var db 								= require('../stores/DataBase.js');

var minutes = 120, fetchInterval = minutes * 60 * 1000;

// WIkipedia connection client
var client = new bot({
	server: 'en.wikipedia.org',  // host name of MediaWiki-powered site
	path: '/w',                  // path to api.php script
	debug: true                 // is more verbose when set to true
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

// regex rules to match lines
// regex variables

var word = '\\s*[\\s\\w]+\\s*'
var linkYear = '\\s*\\[\\[[0-9\\sBC]+\\]\\]\\s*'
var year = '\\s*[0-9\\sBC]+\\s*'

// regex match lines rules
var categoryRegexPattern = new RegExp('==(' + word + ')==');
var entryRegexPattern = new RegExp('\\*('+ linkYear + '|' + year + ')'
	+	'\\s*&ndash;\\s*');
var holidayRegexPattern = new RegExp('(\\*+)\\s*');

/*
* convert lines to normal text by removing extra link description
*	and brackets
*/
var extraLinkDescription = new RegExp('(\\[[^\\]]+\\|)|(\\{[^\\}]+\\|)','ig');
var bracketsRemove = new RegExp('[\\{\\}\\[\\]\\*]+','ig');
var removeWhiteSpaces = new RegExp('\\s|(&nbsp;)', 'g');
var removeDash = new RegExp('&ndash', 'g');

var currentCategory = undefined;

var getCurrentTime = function(){
  return new Date().getTime();
}

// extract title from line based of match of the regex
var extractTitle = function(line, match) {
	var titleIndex = line.indexOf(match[0]) + match[0].length;
	return title = line.substring(titleIndex).replace(extraLinkDescription, '[[')
		.replace(bracketsRemove, '').replace(removeDash, '-').trim();

}

// get page (string, integer)
// make api call for the specified page
var getPage = function(monthDay, time) {
	client.getArticle(
		monthDay,
		function(err, data) {
			// error handling
			console.log('Day', monthDay);
			if (err) {
				console.log('Error Downloading a page');
				return err;
			}
			else {
				processResponse(data, monthDay, time);
			}
		}
	);
};

// get page (string, integer)
// make api call for the specified page
var getAllPages = function() {
	var time = getCurrentTime();
	currentCategory = undefined;
	var day;

	for (var index in months) {
		for (day = 1; day <= months[index].monthDaysNumber; day ++) {
			var monthDay = months[index].monthName.concat('_', day);
				getPage(monthDay, time);
		}
	}
};


/* process response from api call, start parsing and create
	split in lines, and parse every line
*/

var processResponse = function(text, day, time) {
	textLines = text.split('\n');
	for (var lineIndex in textLines) {
			parseLine(textLines[lineIndex], day, time);
	}
};


/*
	Main parsing function. Recives a line, and based on current
	category, calls the WikipediaStore to insert a new category
	entry in database
*/
var parseLine = function(line, day, time) {
	var match = categoryRegexPattern.exec(line);
	// it might be a category
	if (match) {
		var readCategory = match[1].replace(removeWhiteSpaces, '');
		if (categories.indexOf(readCategory) > -1) {
			currentCategory = readCategory.toLowerCase(); // another strinng
		} else {
			currentCategory = undefined;
		}
	} else {
		// it might be a category entry
		if (!currentCategory) {
			return;
		}
		match = entryRegexPattern.exec(line);
		if (match !== null && currentCategory) {
			// extract year
			var year = match[1].replace(bracketsRemove, '')
				.replace(removeWhiteSpaces, '').trim();
			//extract title
			var title = extractTitle(line, match);
			dbStore.insertInCategory(currentCategory, title, day, time, year)
				.catch(function(error) {
					console.log("Insert in db Failed!", error);
				});

		} else {
			// it might be a Holidays and Observances entry
			match = holidayRegexPattern.exec(line);
			if (match !== null && currentCategory) {
				//extract title
				var title = extractTitle(line, match);
				dbStore.insertInCategory(currentCategory, title, day, time)
				.catch(function(error) {
					console.log("Insert in db Failed!", error);
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
		getAllPages();
		// place in loop event queue to call again in 2h
		setInterval(getAllPages, fetchInterval);
	};
}
