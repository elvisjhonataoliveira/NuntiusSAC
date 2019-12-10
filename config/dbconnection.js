/*
	Responsável por fazer a inicialização do banco de dados e por retornar a conexão com o banco.
*/
//modulo para leitura do arquivo de propriedades
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('./config/properties.conf');

const client = require('mongodb').MongoClient;
let _db;
const url = properties.get('db.endpoint');
const dbName = "bimailsender";

function initDb(callback) {
    if (_db) {
        console.warn("Banco já inicilizado, não será feito novamente!");
        return callback(null, _db);
    }
	client.connect(url, {}, connected);
	function connected(err, db) {
        if (err) {
            return callback(err);
        }
        console.log("Banco de dados inicilizado utilizando a URL: "+url);
        _db = db;
        return callback(null, _db);
    }
}

function getDb() {
	if(_db==undefined){
		console.log("Banco de dados não inicilizado, chame o initDb antes.");
	}
    return _db.db(dbName);
}

module.exports = {
    getDb,
    initDb
};