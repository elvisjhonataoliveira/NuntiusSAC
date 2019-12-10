/*
	Classe para realizar a interceptação de todas as requisições HTTP/S da aplicação e fazer a 
	validação se o usuário está logado. 
	Caso não esteja, será direcionado para a página e login.
	Caso já esteja, permite que ele vá para a página necessária.
*/

var interceptor = function(req, res, next){
	//TODO fazer a validação de usuário logado e redirecionar para onde precisa
	// if(!req.session.userLogged && req.url!='/'){
	// 	res.redirect('/');
	// 	return; 
	// }
	next();
} 

module.exports = interceptor;