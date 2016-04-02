module.exports = function(app) {
	app.get('/', function(req, res) {
		res.status(200).json({
			year: req.query.year,
			day: req.query.day,
			category: req.query.category
		});
	});
}
