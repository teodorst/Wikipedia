var mongoose = require('mongoose');

var WikiCategorySchema = new mongoose.Schema({
	title: {type: String, required: true, unique:true},
	year: {type: String, required: true},
	day: {type: String, required: true},
	updated: {type: Number, required: true}
});

WikiHolidaySchema = new mongoose.Schema({
	title: {type: String, required: true, unique:true},
	day: {type: String, required: true},
});

module.exports = {
	Events: mongoose.model('EventsCollection', WikiCategorySchema),
	Births: mongoose.model('BirthsCollection', WikiCategorySchema),
	Deaths: mongoose.model('DeathsCollection', WikiCategorySchema),
	Holidaysandobservances: mongoose.model('HolidaysAndObservancesCollection',
	WikiHolidaySchema)
};
