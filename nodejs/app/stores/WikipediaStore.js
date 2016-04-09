var WikipediaCollections 	= require('../collections/WikipediaCollections.js');

var collections = undefined;

var removeExtraData = function(result) {

};

// create query object for find
var createQueryObject = function(day, year, keyword) {
	var queryObj = {};
	if (day) {
		queryObj['day'] = day;
	}
	if (year) {
		queryObj['year'] = year;
	}
	if (keyword) {
		queryObj['title'] = {"$regex": keyword , "$options": "i" };
	}
	console.log(queryObj);
	return queryObj;
};


// Wikipedia store, the first layer over database
var wikipediaStore = {
	// insert database
	insertInCategory: function(category, title, day, time, year) {
		var updatedObject = {
			title: title,
			day: day,
			year: year,
			category: category,
			updated: time
		};
		// if year exists then it's not a holiday
		if (year) {
			return collections[category].update({
				title: title,
				category: category
			},
			updatedObject,
			{
				upsert: true
			}
		);
		} else {
			// it's an event, death or birth
			return collections[category].update({
				title: title,
				category: category
			},
			updatedObject,
			{
				upsert:true
			}
		);
		}
	},

	// find for a specific category
	findInCategory: function(category, day, year, keyword) {
		var queryObj = createQueryObject(day, year, keyword);
		console.log(category);
		if (category === 'holidaysandobservances') {
			delete queryObj.year;
		}
		return collections[category].find(queryObj).toArray();
	},

	// find in all categories
	findAll: function(day, year, keyword) {
		var queryObj = createQueryObject(day, year, keyword);
		var results = [];
		var promises = [];
		return new Promise(function(resolve, reject) {
			for (var key in collections) {
				if (key !== 'holidaysandobservances') {
					promises.push(collections[key].find(queryObj).toArray());
				}
				else {
					// remove property of year, if exists
					if (queryObj.year) {
						delete queryObj.year;
					}
					promises.push(collections[key].find(queryObj).toArray());
				}
			}
			Promise.all(promises)
				.then(function(data) {
					for (var index in data) {
						results = results.concat(data[index]);
					}
					resolve(results);
				})
				.catch(function(err) {
					reject(err);
				})
		});
	},
	clearCollections: function () {
		// soon
		// WikipediaModels['Events'].remove();
		// WikipediaModels['Deaths'].remove();
		// WikipediaModels['Births'].remove();
		// //WikipediaModels[''].remove({});
	}
};


module.exports = function(dbInstance) {
	if (dbInstance && !collections) {
		collections = WikipediaCollections(dbInstance);
	}

	return wikipediaStore;
};
