module.exports = function(app){
	app.get('/home', function(request, response){
		app.app.controllers.home.home(app, request, response);
	});
}