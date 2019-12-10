const ObjectId = require('mongodb').ObjectID;
let db;
const collectionName = 'user';

function UserDAO(app){
	db = app.config.dbconnection.getDb();
}

UserDAO.prototype.getByID = function(userId, callback){
	db.collection(collectionName).findOne({_id : new ObjectId(userId)}, callback);
}

UserDAO.prototype.get = function(filters, limit, page, sortBy, callback){
	db.collection(collectionName).find(filters).skip(limit*page).limit(limit).sort(sortBy).toArray(callback);
}

UserDAO.prototype.save = function(user, callback){
	user.updatedDate = new Date();
	let whereClause = {};
	whereClause.email = user.email;
	if(user._id!=undefined){
		delete user._id;
		//remove o ID pois a chave primária é o email do usuário. SE colocar o ID no where
		// um mesmo e-mail poderá ter 2 usários diferentes
	} else {
		user.creationDate = new Date();	
	}
	db.collection(collectionName).updateOne(whereClause, {$set: user}, {upsert: true}, callback);	
}

module.exports = function(){
	return UserDAO;
}