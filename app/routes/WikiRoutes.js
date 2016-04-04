WikiService 			= require('../services/WikiService.js');

module.exports = function(app) {
	app.get('/', function(req, res) {
		var year = req.query.year;
		var day = req.query.day;
		var category = req.query.category;
		var keyword = req.query.keyword;
		WikiService.getData(req.query.day, req.query.year, req.query.category,
			req.query.keyword)
			.then(function(data) {
				console.log(data);
				res.status(200).json({
					results: data,
					length: data.length
				});
			})
			.catch(function(err) {
				console.log(err);
				res.status(200).json({
					year: req.query.year,
					day: req.query.day,
					category: req.query.category
				});
			});
	});
}
