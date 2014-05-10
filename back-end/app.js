/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes'), score = require('./routes/score'), place = require('./routes/place'), subject = require('./routes/subject'), http = require('http'), path = require('path');

var app = express();

var config = require('./config');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk(config.mongodb.host + ':' + config.mongodb.port + '/iculture');
var Db = mongo.Db;
var Server = mongo.Server;
var odb = new Db('iculture', new Server(config.mongodb.host,
		config.mongodb.port), {
	safe : false
});

var cors = require('cors');

// all environments
app.set('port', config.web.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(cors());


app.use(function(req, res, next) {
	req.db = db;
	req.odb = odb;
	next();
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/places', place.list);
app.get('/places/init', place.init);

app.get('/subjects/init', subject.init);
app.get('/subjects', subject.list);

app.get('/score', score.list);
app.post('/score', score.insert);

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
