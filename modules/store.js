var fs = require('fs');

var storefile = 'store.json';
var initialfile = 'store.json.initial';


//initialize store file
fs.exists(storefile, function(exists){
	if(!exists){
		//read initial file
		fs.readFile(initialfile, 'utf8', function(err, data) {
			//write to store.json
			fs.writeFile(storefile, data, function(err) {
				
			});
		});
	}
})




exports.set = function(data, callback) {
	fs.writeFile(storefile, JSON.stringify(data), function(err) {
		callback(err);
	});
}


exports.get = function(callback){
	fs.readFile(storefile, 'utf8', function(err, data) {
		return callback(err, JSON.parse(data));
	});
}