module.exports = function(dbInstance) {
	// creating collections if they don't exits
	var collections = {
		events: dbInstance.collection('EventsCollection'),
		births: dbInstance.collection('BirthsCollection'),
		deaths: dbInstance.collection('DeathsCollection'),
		holidaysandobservances: dbInstance.collection(
			'HolidaysAndObservancesCollection'
		)
	};

	// creating collections indexes
	collections['events'].createIndex({title: 1}, {unique: true})
		.catch(function(err){
			console.log(arguments);
		});
	collections['births'].createIndex({title: 1}, {unique: true})
		.catch(function(err){
		});
	collections['deaths'].createIndex({title: 1}, {unique: true})
		.catch(function(err){
			console.log(arguments);
		});
	collections['holidaysandobservances'].createIndex({title: 1}, {unique: true})
		.catch(function(err){
			console.log(arguments);
		});

	return collections;
}
