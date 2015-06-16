var express = require('express');
var cors = require('cors');

var app = express();
var config = require('./config');


app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//static frontend
app.use(express.static(__dirname + '/frontend'));






api.get('/resource', function(req, res, next){});






//start server
app.listen(config.port, function(err){
    console.log('WebRTC App started on port ' + config.port);
});

