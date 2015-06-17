var store = require('../modules/store');


exports.list = function(req, res, next) {
	store.get(function(err, data){
		if(err) return next(err);
		
		var out = {};
		
		for(var key in data.accounts){
			var account = data.accounts[key];
			
			out[key] = account.display;
		}
		
		res.json(out);
	});	
}





exports.getOne = function(req, res, next) {
	
	store.get(function(err, data){
		if(err) return next(err);
		
		if(!data.accounts.hasOwnProperty(req.params.id)){
			return next(new Error('Account not found'));
		}
		
		var acc = data.accounts[req.params.id];
		acc.id = req.params.id;
		
		res.json(acc);
	});	
}




exports.delete = function(req, res, next) {
	
	store.get(function(err, data){
		if(err) return next(err);
		
		if(!data.accounts.hasOwnProperty(req.params.id)){
			return next(new Error('Account not found'));
		}
		
		delete data.accounts[req.params.id];
		
		//save to store
		store.set(data, function(err){
			if(err) return next(err);
			
			res.send();
		});
	});	
}