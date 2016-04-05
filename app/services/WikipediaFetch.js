var bot 							= require('nodemw');
var WikipediaStore 		= require('../stores/WikipediaStore.js');
var db 								= require('../stores/DataBase.js');
var EventEmitter 			= require('events');

console.log(EventEmitter);

var minutes = 120, interval = minutes * 60 * 1000;
var eventEmitter = new EventEmitter();


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

var getCurrentTime = function(){
  return new Date().getTime();
}

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

var parseLine = function(line, day, time, promises) {
	var matches = categoryRegexPattern.exec(line);
	// it might be a category
	if (matches) {
		var readCategory = matches[1].replace(removeWhiteSpaces, '');
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
		matches = entryRegexPattern.exec(line);
		if (matches !== null && currentCategory) {
			var year = matches[1].replace(bracketsRemove, '')
				.replace(removeWhiteSpaces, '').trim();
			var title = matches[2].replace(extraLinkDescription, '[[')
				.replace(bracketsRemove, '').replace('&ndash', '-').trim();

			promises.push(dbStore.insertInCategory(currentCategory, title, day,
				time, year));

		} else {
			// it might be a Holidays and Observances entry
			matches = holidayRegexPattern.exec(line);
			if (matches !== null && currentCategory) {
				var title = matches[2].replace(extraLinkDescription, '[[')
					.replace(bracketsRemove, '').replace('&ndash', '-').trim();

				promises.push(dbStore.insertInCategory(currentCategory, title, day,
					time));
			}
		}
	}
};


if (!module.parent) {

	var dbInstance;
	var currentDay = 0, currentMonth = months[0].monthName, monthIndex = 0;
	var _that = this;

	console.log('Database fetch started');

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

	eventEmitter.on('fetchCompleted', function() {
		console.log('Database fetched completed!');
		db.closeConnection();
		process.exit(0);
	});

	db.connect()
		.then(function(dbInstance) {
			dbStore = WikipediaStore(dbInstance);
			eventEmitter.emit('nextDay');
		})
		.catch(function(err){
			process.exit(127);
		});
}
