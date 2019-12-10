//modulo para leitura do arquivo de propriedades
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('./config/properties.conf');



const app = require('./config/server');

app.config.dbconnection.initDb(function(err, db){
	if(err){
		console.log('Erro ao se conectar ao banco de dados')
		console.log(err);
	}
	app.listen(properties.get('app.port'), function(){
		console.log('Servidor iniciado com sucesso na porta '+httpPort);
		new app.app.modules.MailingSender().schedulle(app);
	});	
});