//Exibe a página inicial
module.exports.home = function(application, request, response){
	response.render('home/home', {errors: {}});	
}