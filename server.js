var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');

var app = express();
var api = express.Router();

var config = require('./config');
var store = require('./modules/store');



api.use(cors({ origin: '*' }));
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({
    extended: true
}));

//static frontend
app.use(express.static(__dirname + '/frontend'));





//EXAMPLE RESOURCE
api.get('/resource', function(req, res, next){
	store.get(function(err, data){
		//manipulate data...
		
		//save to store
		store.set(data, function(err){
			console.log(err);
			
			res.send();
		});
		
	});
});




//assign api router to /api
app.use('/api', api);

//start server
app.listen(config.port, function(err){
    console.log('WebRTC App started on port ' + config.port);
});

