fs = require('fs');

exports.set = function(data, callback) {
	fs.writeFile('store.json', JSON.stringify(data), function(err) {
		callback(err);
	});
}


exports.get = function(callback){
	fs.readFile('store.json', 'utf8', function(err, data) {
		return callback(err, JSON.parse(data));
	});
}