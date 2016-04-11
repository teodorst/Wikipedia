var bot 							= require('nodemw');
var WikipediaStore 		= require('../stores/WikipediaStore.js');
var db 								= require('../stores/DataBase.js');
var EventEmitter 			= require('events');
var fs 								= require('fs');

var minutes = 120, interval = minutes * 60 * 1000;
var eventEmitter = new EventEmitter();

var TIMELOG_PATH = 'timelog.txt'

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


var getLastUpdateTime = function(currentTime) {
	return new Promise(function(resolve, reject) {
		fs.stat(TIMELOG_PATH, function(err, stats) {
			if (err) {
				fs.appendFileSync(TIMELOG_PATH, currentTime + '\n');
				resolve(undefined);
				return;
			}
			var lastUpdatedTime = undefined;
			if (stats.isFile()) {
				fs.readFile(TIMELOG_PATH, function(err, buf) {
					linesArray = buf.toString().split('\n');
					lastUpdatedTime = linesArray[linesArray.length - 2];
					fs.appendFileSync(TIMELOG_PATH, currentTime + '\n');
					resolve(parseInt(lastUpdatedTime, 10))
				});
			}
			else {
				// is not a regular file
				// i can't write new current time
				resolve(undefined)
			}
		});
	});
}

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
var getPage = function(currentDay, monthIndex, currentTime) {
	client.getArticle(months[monthIndex].monthName + '_' + currentDay,
		function(err, response) {
			// error handling
			//console.log(response)
			if (err) {
				console.error(currentDay + ' Download Failed');
				eventEmitter.emit('nextDay', currentDay, monthIndex, currentTime);
				return err;
			}
			processResponse(response, currentDay, monthIndex, currentTime);
		}
	);
}


/* process response from api call, start parsing and create
	the arrays of promises.
	emit event when all promises are completed
*/
var processResponse = function(text, currentDay, monthIndex, currentTime) {
	var promises = [];
	var pageProperties = {
		currentDay: months[monthIndex].monthName + '_' + currentDay,
		currentCategory: undefined,
		currentTime: currentTime
	};
	textLines = text.split('\n');
	for (var lineIndex in textLines) {
			parseLine(textLines[lineIndex], pageProperties, promises);
	}
	Promise.all(promises)
		.then(function(data){

			console.log(months[monthIndex].monthName + '_' + currentDay + " completed");
			eventEmitter.emit('nextDay', currentDay, monthIndex, currentTime);
		})
		.catch(function(err) {
			console.log(day + " failed");
			eventEmitter.emit('nextDay', currentDay, monthIndex, currentTime);
		})
};


/*
	Main parsing function. Recives a line, and based on current
	category, calls the WikipediaStore to insert a new category
	entry in database
*/


//finish this function in the morning.
var parseLine = function(line, pageProperties, promises) {
	var match = categoryRegexPattern.exec(line);

	// if it is a category
	if (match) {
		var readCategory = match[1].replace(removeWhiteSpaces, '');
		// check if it's a desired category
		if (categories.indexOf(readCategory) > -1) {
			pageProperties.currentCategory = readCategory.toLowerCase(); // another strinng
		} else {
			pageProperties.currentCategory = undefined;
		}
	} else {
		// if it is a category entry
		if (!pageProperties.currentCategory) {
			return;
		}
		match = entryRegexPattern.exec(line);
		if (match !== null && pageProperties.currentCategory) {
			//extract year
			var year = match[1].replace(bracketsRemove, '')
				.replace(removeWhiteSpaces, '').trim();
			//extract title
			var title = extractTitle(line, match);
			// add another promise
			promises.push(dbStore.insertInCategory(pageProperties.currentCategory,
				title, pageProperties.currentDay, pageProperties.currentTime,	year));
		} else {
			if (!pageProperties.currentCategory) {
				return;
			}
			// it it is a Holidays and Observances entry
			match = holidayRegexPattern.exec(line);
			if (match !== null && pageProperties.currentCategory) {
				//extract title
				var title = extractTitle(line, match);
				promises.push(dbStore.insertInCategory(pageProperties.currentCategory,
					title, pageProperties.currentDay, pageProperties.currentTime));
			}
		}
	}
};


// -------Events handlers -------------
// next day event handler
// if it's the last day of year, December_31 then close fire
// fetchedCompleted event
eventEmitter.on('nextDay', function	(currentDay, monthIndex, currentTime) {
	if (currentDay >= months[monthIndex].monthDaysNumber) {
		if (monthIndex === months.length-1) {

			getLastUpdateTime(startTime)
				.then(function(time){
					eventEmitter.emit('cleanUp', 0, time);
				})
			return;
		}
		else {
			monthIndex ++;
			currentDay = 1;
		}
	}
	else {
		currentDay ++;
	}
	getPage(currentDay, monthIndex, currentTime);
});

eventEmitter.on('cleanUp', function(categoryIndex, oldTime) {

	if(categoryIndex >= 4 || oldTime === undefined) {
		eventEmitter.emit('fetchCompleted');
		return;
	}

	dbStore.cleanUpCategory(categories[categoryIndex], oldTime)
		.then(function(removedItems) {
			console.log('Clean up ' + categories[categoryIndex] + 'completed');
			eventEmitter.emit('cleanUp',categoryIndex + 1, oldTime);
		})
		.catch(function(error) {
			console.log('Clean up ' + categories[categoryIndex] + 'failed');
			eventEmitter.emit('cleanUp',categoryIndex + 1, oldTime);
		});
});

// close db connection and finish script
eventEmitter.on('fetchCompleted', function() {
	console.log('Database fetched completed!');
	db.closeConnection();
	var finishTime = getCurrentTime();
	console.log((finishTime - startTime) / 1000);
	process.exit(0);
});


if (!module.parent) {
	var startTime = getCurrentTime()
	var dbInstance;
	var currentDay = 0, currentMonth = months[0].monthName, monthIndex = 0;
	var _that = this;

	console.log('Database fetch started');

	// connect to db
	db.connect()
		.then(function(dbInstance) {
			dbStore = WikipediaStore(dbInstance);
			eventEmitter.emit('nextDay', 30, 11, startTime);
		})
		.catch(function(err){
			console.log('err');
			process.exit(127);
		});
}
