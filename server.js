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
	log.info("I want group INFO about " + req.params.id);
//	return GroupModel.findById(req.params.id, function (err, group) {
console.log('Start... ' + req.params.id + ' and type is ' + typeof req.params.id);
//	return GroupModel.find({ $or: [{id: req.params.id}, {screen_name: req.params.id}]}, function (err, group) {
	return GroupModel.find({screen_name: req.params.id}, function (err, group) {
		console.log('req.params.id>>> ' + req.params.id);
//		console.log(group);
		if(!group.length) {
			log.info('Группа в БД не обнаружена');
			log.error(err);
			var vk = new VK({
				'appId'     : 4744452,
				'appSecret' : 'RzpMCpbjiomPF5sKBSh4',
				'language'  : 'ru'
			});

			var sum_count = 0;

			vk.request('groups.getById', {'group_ids' : req.params.id, 'fields': 'members_count'}, function(_o) {
//				log.info('DONE');
				console.log(_o.response);
				console.log(_o.response[0].id);
				console.log(_o.response[0].members_count);

				sum_count+=0;
				var
					members = [],
					key = (_o.response[0].members_count / 1000 | 0) + 1,
					group_id = _o.response[0].id,
//					group = _o.response[0];
					screen_name = _o.response[0].screen_name,
					members_count = _o.response[0].members_count,
					name = _o.response[0].name,
					is_closed = _o.response[0].is_closed;

				if (members_count > 120000) {
					res.statusCode = 400;
					return res.send('Too large members count. Now we can work with groups with members_count less than 120k. Sorry.');
				}

				var i = 0;
				while (i < _o.response[0].members_count) {
//					console.log('i = ' + i);

					vk.request('groups.getMembers', {'group_id' : group_id, 'offset': i, count: 1000}, function(_o) {
						sum_count+=_o.response.items.length;
						members = members.concat(_o.response.items);

console.log('members count = ' + members.length);

						if (--key === 0) {
							console.log('<<<<===>DONE_DONE_DONE>>>===');

							var group = new GroupModel({
								id: group_id,
								url: group_id,
								screen_name: screen_name,
								members_count: members_count,
								name: name,
								is_closed: is_closed,
								description: 'desription',
								members: members
//								members: [1,2,3]
                            });
    group.save(function (err) {
        if (!err) {
            console.log("group created!");
//            return res.send({ status: 'OK', group:group });
        } else {
            console.log(err);
            if(err.name == 'ValidationError') {
//                res.statusCode = 400;
//                res.send({ error: 'Validation error' });
				console.log('Validation error')
            } else {
//                res.statusCode = 500;
//                res.send({ error: 'Server error' });
				console.log('Server error');
            }
            console.log('error id: ' + res.statusCode,err.message);
//            log.error('Internal error(%d): %s',res.statusCode,err.message);
        }
    });
//							console.log(members);
							return res.send(members);
						}
//						console.log('(key) = ' + key);

					});

					i+=1000;
				};
			});

		} else {
			console.log('I find this DataBase!!!');
//			console.log(group);
			console.log('Name: ' + group[0].name);
			return res.send(group[0].members);
		}
		console.log('<<<ERROR>>>');
		console.log(err);
//		if (!err) {
//			return res.send({ status: 'OK', article:article });
//		} else {
//			res.statusCode = 500;
//			log.error('Internal error(%d): %s',res.statusCode,err.message);
//			return res.send({ error: 'Server error' });
//		}
	});
});


app.get('/ErrorExample', function(req, res, next){
	next(new Error('Random error!'));
});

app.listen(config.get('port'), function(){
	log.info('Express server listening on port ' + config.get('port'));
});