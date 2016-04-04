var bot 							= require('nodemw');
var WikipediaStore 		= require('../stores/WikipediaStore.js');
var db 								= require('../stores/DataBase.js');
var EventEmitter 			= require('events');

console.log(EventEmitter);

var minutes = 120, interval = minutes * 60 * 1000;

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


// regex rulles to match lines
var characters = '\\s\u00C0-\u017F\\w\\:\\&\|\';\.\(\),\!\-';
var linkYear = '\\s*\\[\\[[0-9\\sBC]+\\]\\]\\s*';
var year = '\\s*[0-9\\sBC]+\\s*';
var linkWord = '\\s*(['+ characters + '\\[\\]]+,*\\s*)*';
var word = '\\s*[' + characters + ']+\\s*';
var categoryRegexPattern = new RegExp('==(' + word + ')==');
var entryRegexPattern = new RegExp('\\*('+ linkYear + '|' + year + ')&ndash;'
	+ '(' + linkWord + '|' + word + ')+');
var holidayRegexPattern = new RegExp('(\\*+)(' + linkWord + ')+');
var extraLinkDescription = new RegExp('\\[[^\\]]+\\|','ig');
var bracketsRemove = new RegExp('[\\[\\]\\*]+','ig');
var removeWhiteSpaces = new RegExp('\\s', 'g');
var removeDash = new RegExp('&ndash', 'g');

var currentCategory = undefined;
var currentDay;

var getAllPages = function() {
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
					processResponse(data, monthDay);
				}
			);
		}
	}
	console.log('gata');
};

var getPage = function(day) {

}


var processResponse = function(text, day) {
	textLines = text.split('\n');
	for (var lineIndex in textLines) {
			parseLine(textLines[lineIndex], day);
	}
};

var parseLine = function(line, day) {
	var matches = categoryRegexPattern.exec(line);
	// it might be a category
	if (matches) {
		var readCategory = matches[1].replace(removeWhiteSpaces, '');
		if (categories.indexOf(readCategory) > -1) {
			currentCategory = readCategory; // another strinng
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
			dbStore.saveEntry(
				currentCategory,
				matches[2].replace(extraLinkDescription, '[[')
					.replace(bracketsRemove, '').replace('&ndash', '-').trim(),
				day,
				matches[1].replace(bracketsRemove, '').replace(removeWhiteSpaces, '').trim()
			).then(function(data) {
					console.log("Insert complete");
				})
				.catch(function(error) {
					console.log("Insert Failed!", err);
				});
		} else {
			// it might be a Holidays and Observances entry
			matches = holidayRegexPattern.exec(line);
			if (matches !== null && currentCategory) {
				//console.log(	"MATCH", currentCategory, matches);
				dbStore.saveEntry(
					currentCategory,
					matches[2].replace(extraLinkDescription,'[[')
						.replace(bracketsRemove, '').replace(removeDash, '-'),
					day
				).then(function(data) {
					console.log("Insert Complete!");
				}).catch(function(error) {
					console.log("Insert Failed!", err);
				});
			}
		}
	}
};

if (!module.parent) {
	
	nextDayEmitter = new EventEmitter();
	nextDayEmitter.on('nextDay', function	(){
		console.log('nextDay');
	})

	nextDayEmitter.emit('nextDay');

	db.connect()
		.then(function(dbInstance) {
			dbStore = WikipediaStore(dbInstance);
			client.getArticle('December_31', function(err, data) {
		    // error handling
		    if (err) {
		      console.error(err);
		      return;
		    }
				processResponse(data, 'December_31');
			});
		})
		.catch(function(err){
			process.exit(127);
		});
} else {
	module.exports = function(db) {
		dbStore = WikipediaStore(db);
		dbStore.clearCollections();

		//getAllPages(client);
		client.getArticle('March_13', function(err, data) {
	    // error handling
	    if (err) {
	      console.error(err);
	      return err;
	    }
			processResponse(data, 'March_13');
			dbStore.queryByKeyword('is', 'Events')
			.then(function(data){
				//console.log(data);
			})
			.catch(function(err){
				console.log(err);
			});
		});

	};
}
