var bot 							= require('nodemw');
var WikipediaStore 		= require('../stores/WikipediaStore.js');
var db 								= require('../stores/DataBase.js');
var EventEmitter 			= require('events');

var minutes = 120, interval = minutes * 60 * 1000;
var eventEmitter = new EventEmitter();


// WIkipedia connection client
var client = new bot({
	server: 'en.wikipedia.org',  // host name of MediaWiki-powered site
	path: '/w',                  // path to api.php script
	debug: false                 // is more verbose when set to true
});

// wikipedia categories
var categories = ["Events", "Births", "Deaths", "Holidaysandobservances"];

// static months array
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

// used to know what's the category that i'm parsing
var currentCategory = undefined;

// get current time system time
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
			if (err) {
				console.error(monthDay + ' Download Failed');
				eventEmitter.emit('nextDay');
				return err;
			}
			processResponse(data, time, monthDay);
		}
	);
}


/* process response from api call, start parsing and create
	the arrays of promises.
	emit event when all promises are completed
*/
var processResponse = function(text, time, day) {
	var promises = [];
	textLines = text.split('\n');
	for (var lineIndex in textLines) {
			parseLine(textLines[lineIndex], day, time, promises);
	}
	Promise.all(promises)
		.then(function(data){
			console.log(day + " completed");
			eventEmitter.emit('nextDay');
		})
		.catch(function(err) {
			console.log(day + " failed");
			console.log(err);
			eventEmitter.emit('nextDay');
		})
};


/*
	Main parsing function. Recives a line, and based on current
	category, calls the WikipediaStore to insert a new category
	entry in database
*/
var parseLine = function(line, day, time, promises) {
	var match = categoryRegexPattern.exec(line);

	// if it is a category
	if (match) {
		var readCategory = match[1].replace(removeWhiteSpaces, '');
		// check if it's a desired category
		if (categories.indexOf(readCategory) > -1) {
			currentCategory = readCategory.toLowerCase(); // another strinng
		} else {
			currentCategory = undefined;
		}
	} else {
		// if it is a category entry
		if (!currentCategory) {
			return;
		}
		match = entryRegexPattern.exec(line);
		if (match !== null && currentCategory) {
			//extract year
			var year = match[1].replace(bracketsRemove, '')
				.replace(removeWhiteSpaces, '').trim();
			//extract title
			var title = extractTitle(line, match);
			// add another promise
			promises.push(dbStore.insertInCategory(currentCategory, title, day,
				time, year));
		} else {
			if (!currentCategory) {
				return;
			}
			// it it is a Holidays and Observances entry
			match = holidayRegexPattern.exec(line);
			if (match !== null && currentCategory) {
				//extract title
				var title = extractTitle(line, match);
				promises.push(dbStore.insertInCategory(currentCategory, title, day,
					time));
			}
		}
	}
};


if (!module.parent) {
	var startTime = getCurrentTime()
	var dbInstance;
	var currentDay = 0, currentMonth = months[0].monthName, monthIndex = 0;
	var _that = this;

	console.log('Database fetch started');

	// next day event handler
	// if it's the last day of year, December_31 then close fire
	// fetchedCompleted event
	eventEmitter.on('nextDay', function	() {
		if (currentDay >= months[monthIndex].monthDaysNumber) {
			if (currentMonth === months[months.length-1].monthName) {
				eventEmitter.emit('fetchCompleted');
				return;
			}
			else {
				monthIndex ++;
				currentMonth = months[monthIndex].monthName;
				console.log(currentMonth);
				currentDay = 1;
			}
		}
		else {
			currentDay ++;
		}
		getPage(currentMonth + '_' + currentDay);
	});

	// close db connection and finish script
	eventEmitter.on('fetchCompleted', function() {
		console.log('Database fetched completed!');
		db.closeConnection();
		var finishTime = getCurrentTime();
		console.log((finishTime - startTime) / 1000);
		process.exit(0);
	});

	// connect to db
	db.connect()
		.then(function(dbInstance) {
			dbStore = WikipediaStore(dbInstance);
			eventEmitter.emit('nextDay');
		})
		.catch(function(err){
			console.log('err');
			process.exit(127);
		});
}
