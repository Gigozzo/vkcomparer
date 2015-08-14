var bodyParser	= require('body-parser')
var express		= require('express');
var path		= require('path');
var passport	= require('passport');
var config		= require('./libs/config');
var log			= require('./libs/log')(module);
var oauth2		= require('./libs/oauth2');
var ArticleModel= require('./libs/mongoose').ArticleModel;
var expressHbs	= require('express3-handlebars');
var request		= require('request');
var app = express();

var GroupModel = require('./libs/mongoose').GroupModel;

var MAIN_TOKEN = '';

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(passport.initialize());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, "public")));

app.engine('handlebars', expressHbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

require('./libs/auth');

app.use(function(req, res, next){
	res.status(404);
	log.debug('Not found URL: %s',req.url);
	res.send({ error: 'Not found' });
	return;
});

app.use(function(err, req, res, next){
	res.status(err.status || 500);
	log.error('Internal error(%d): %s',res.statusCode,err.message);
	res.send({ error: err.message });
	return;
});

app.get('/api', function (req, res) {
	res.send('API is running. Build RESTful!');
});

// Получить список загруженных групп: {id группы, url группы}
app.get('/api/groups', function (req, res) {
	log.info("I want groups");
	return GroupModel.find(function (err, groups) {
		if (!err) {
			return res.send(groups);
		} else {
			res.statusCode = 500;
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			return res.send({ error: 'Server error' });
		}
	});
});


app.get('/ErrorExample', function(req, res, next){
	next(new Error('Random error!'));
});

app.listen(config.get('port'), function(){
	log.info('Express server listening on port ' + config.get('port'));
});