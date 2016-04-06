var WikipediaCollections 	= require('../collections/WikipediaCollections.js');

var collections = undefined;

var removeExtraData = function(result) {

};

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


var wikipediaStore = {
	insertInCategory: function(category, title, day, time, year) {
		if (year) {
			return collections[category].update({
				title: title,
				category: category
			},
			{
				title: title,
				day: day,
				year: year,
				category: category,
				updated: time
			},
			{
				upsert: true
			}
		);
		} else {
			return collections[category].update({
				title: title,
				category: category
			},
			{
				title: title,
				day: day,
				category: category,
				updated: time
			},
			{
				upsert:true
			}
		);
		}
	},
	findInCategory: function(category, day, year, keyword) {
		var queryObj = createQueryObject(day, year, keyword);
		console.log(category);
		if (category === 'holidaysandobservances') {
			delete queryObj.year;
		}
		return collections[category].find(queryObj).toArray();
	},

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
					if (queryObj.year) {
						console.log('BEFORE DELETE: ',queryObj);
						delete queryObj.year;
						console.log('AFTER DELETE:', queryObj);
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
