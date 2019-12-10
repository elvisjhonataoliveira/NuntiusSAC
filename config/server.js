// Configuração dos modulos necessários para a aplicação rodar
const express = require('express');
const consign = require('consign');
const ejs = require('ejs');
const expressValidator = require('express-validator');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
//modulo para interceptar as requisições http
const interceptor = require('./interceptor');

const app = express();

// Setando a view engine para utilizar o ejs
app.set('view engine', 'ejs');
// Especificando o diretório de views do ejs
app.set('views', './app/views');

//Setando o body-parser para transformação de queryParam/body em JSON
app.use(bodyParser.urlencoded({extended:true}));
//Setando o express-session 
app.use(expressSession({
	secret: 'bimailsenderpasoweroi123123',
	resave: false,
	saveUninitialized: false
}));
//Setando o diretório estático da aplicação
app.use(express.static('./app/public'))
//Setando o express-validator para ser utilizado no projeto
app.use(expressValidator());

//Aplica um interceptor para validação de usuário
app.use(interceptor);

//Configurando o consign
consign()
	.include('./app/routes')
	.then('./app/controllers')
	.then('./app/models')
	.then('./config/dbconnection.js')
	.then('./app/modules')
	.into(app);

module.exports = app;