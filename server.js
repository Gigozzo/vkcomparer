var bodyParser	= require('body-parser')
var express		= require('express');
var path		= require('path');
var passport	= require('passport');
var config		= require('./libs/config');
var log			= require('./libs/log')(module);
var oauth2		= require('./libs/oauth2');
var expressHbs	= require('express3-handlebars');
var request		= require('request');
var VK          = require('vksdk');
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
app.get('/api/group', function (req, res) {
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

// Получить инфу о группе
app.get('/api/group/:id', function (req, res) {
	log.info("I want group INFO");
	return GroupModel.findById(req.params.id, function (err, group) {
		console.log('req.params.id>>> ' + req.params.id);
		if(!group) {
			log.info('Группа в БД не обнаружена');
			var vk = new VK({
				'appId'     : 4744452,
				'appSecret' : 'RzpMCpbjiomPF5sKBSh4',
				'language'  : 'ru'
			});

			var sum = 0;

			vk.request('groups.getById', {'group_ids' : req.params.id, 'fields': 'members_count'}, function(_o) {
				log.info('DONE');
				console.log(_o.response);
				console.log(_o.response[0].id);
				console.log(_o.response[0].members_count);

				sum+=0;

				var i = 0;
				while (i < _o.response[0].members_count) {
					console.log('i = ' + i);

					vk.request('groups.getMembers', {'group_id' : _o.response[0].id, 'offset': i, count: 1000}, function(_o) {
						sum+=_o.response.items.length;
						console.log('(SUM) = ' + sum);
					});

					i+=1000;
				};
			});

		}
		if (!err) {
			return res.send({ status: 'OK', article:article });
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