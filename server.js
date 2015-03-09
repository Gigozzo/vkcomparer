var bodyParser      = require('body-parser')
var express         = require('express');
var path            = require('path');
var passport        = require('passport');
var config          = require('./libs/config');
var log             = require('./libs/log')(module);
var oauth2          = require('./libs/oauth2');
var ArticleModel    = require('./libs/mongoose').ArticleModel;
var expressHbs      = require('express3-handlebars');
var request         = require('request');
var app = express();

var OrganizationModel = require('./libs/mongoose').OrganizationModel;

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

/*
app.render('email', { name: 'Tobi' }, function(err, html){
  // ...
});
*/

app.get('/', function (req, res) {
    console.log('GET_GET_GET');
    console.log('MAIN_TOKEN = ' + MAIN_TOKEN);
    //MAIN_TOKEN ? res.render('organizations', {'organizations': [{'title': 'this is title (test)', 'net': '165.321.213.321 (test)'}]}) : res.render('login', {})
    if (MAIN_TOKEN) {
        request({url:'http://127.0.0.1:1339/api/organizations', headers: {'Authorization': "Bearer " + MAIN_TOKEN}}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log('<<ORGANIZATIONS>>');
                // Обработать получение ошибки
                //console.log(response.body);
                console.log(JSON.parse(response.body));
                res.render('organizations', {'organizations': JSON.parse(response.body)});
                //res.render('organizations', {'organizations': [{'title': 'this is title (test)', 'net': '165.321.213.321 (test)'}]});
                //res.redirect('/');
                //res.send(JSON.parse(response.body));
            }
        });
////    //res.render('organizations', {'organizations': [{'title': 'this is title (test)', 'net': '165.321.213.321 (test)'}]});
    } else {
        res.render('login', {});
    };
    console.log('END_get');
});

app.post('/', function (req, res) {
console.log('POST_POST_POST');
console.log(req.params);
console.log(req.body);

if (req.body.username && req.body.password) { // LOGIN
    console.log('LOGIN');

    var USERNAME = req.body.username,
        PASSWORD = req.body.password;

        request.post('http://localhost:1339/oauth/token', function (error, response, body){
            var refresh_token = JSON.parse(response.body).refresh_token;
            request.post('http://localhost:1339/oauth/token', function (error, response, body){
               var access_token = JSON.parse(response.body).access_token;
               MAIN_TOKEN = access_token;
               /////////////////////////////////////////////////////////////////////////////////
//             MAIN_TOKEN ? res.render('home', {}) : res.render('login', {'err': 'User with this username and password does not exist.'});
               if (MAIN_TOKEN) {
                //// ПОВТОРЕНИЕ GET
                    //app.route('/').get();

                    res.redirect('/'); // Не делать статус 200
                    //request.get('http://localhost:1339/');
                    //res.end('ok');
                    //app.use();

                    //res.send('Loaded');
                    //return true;
                    //console.log('Ещё выполняется...');
                    //res.render('organizations', {});// Переход на адрес '/organizations'
               } else {
                    res.render('login', {'err': 'User with this username and password does not exist.'});
               };
               console.log('Ещё выполняется...');
               /////////////////////////////////////////////////////////////////////////////////
            }).form({
                grant_type: 'refresh_token',
                client_id: 'mobileV1',
                client_secret: 'abc123456',
                refresh_token: refresh_token
            });
        }).form({
            grant_type: 'password',
            client_id: 'mobileV1',
            client_secret: 'abc123456',
            username: USERNAME,
            password: PASSWORD
        });
} else { // NO LOGIN => Add organization <<< Отправка POST >>>
    if (MAIN_TOKEN) {
 
        console.log('NO LOGIN');
        console.log('MAIN_TOKEN = ' + MAIN_TOKEN);
        // Сохранить новую организацию и перейти к '/'
        request.post({url:'http://127.0.0.1:1339/api/organizations', headers: {'Authorization': "Bearer " + MAIN_TOKEN}}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log('<<ORGANIZATIONS>>');
                // Обработать получение ошибки
                console.log(response.body);
                console.log(JSON.parse(response.body));
                res.redirect('/');
                //res.send(JSON.parse(response.body));
            }
        })//.form(response.body);
        .form({
            title: req.body.title, //'Org_no_1',
            //author: 'This user',
            //description: 'Some text',
            nets: req.body.nets //'123.12.12.12'
        });
    } else {
        res.render('login', {});//{'err': 'User with this username and password does not exist.'});
    }
}});

app.get('/general', function (req, res) {
    //res.send('GENERAL is running');
    request('http://www.google.com', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body) // Print the google web page.
            res.send(body);
        }
    })
});

app.get('/take-it', function (req, res) {
    //res.send(JSON.parse({req:'ew'}));
    request('http://127.0.0.1:1339/test', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body) // Print the google web page.
            res.send(body);
        }
    })
});

app.get('/take-articles', function (req, res) {
    request.get({url:'http://127.0.0.1:1339/api/articles', headers: {'Authorization': "Bearer " + MAIN_TOKEN}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('<<articles>>');
            console.log(JSON.parse(response.body));
            res.send(JSON.parse(response.body));
        }
    })
});

app.get('/take-organizations', function (req, res) {
    request.get({url:'http://127.0.0.1:1339/api/organizations', headers: {'Authorization': "Bearer " + MAIN_TOKEN}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
           console.log('<<organizations>>');
           console.log(JSON.parse(response.body));
           res.send(JSON.parse(response.body));
        }
    })
});

/*
http POST http://localhost:1337/oauth/token grant_type=password client_id=mobileV1 client_secret=abc123456 username=andrey password=simplepassword

http POST http://localhost:1337/oauth/token grant_type=refresh_token client_id=mobileV1 client_secret=abc123456 refresh_token=TOKEN

http http://localhost:1337/api/userinfo Authorization:'Bearer TOKEN'
*/

app.get('/take-userinfo', function (req, res) {
    request.get({url:'http://127.0.0.1:1339/api/userinfo', headers: {'Authorization': "Bearer " + MAIN_TOKEN}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log(body) // Print the google web page.
            console.log(JSON.parse(response.body));
            res.render('home', {});
////        res.send(JSON.parse(response.body));
            //res.send(body);
        }
    })//.debug = true//.auth(null, null, true, '\'Bearer ' + MAIN_TOKEN + '\'')
});

app.get('/login', function (req, res) {
        request.post('http://localhost:1339/oauth/token', function (error, response, body){
            //res.send(response + '\n\n/////////////////////\n\n' + body);
            //res.send(response.body);
            //res.send(JSON.parse(response.body));
            console.log('(1)response.body>>>');
            console.log(JSON.parse(response.body));
            //res.send(JSON.parse(response.body).refresh_token);
            var refresh_token = JSON.parse(response.body).refresh_token;
            //localhost:1337/oauth/token grant_type=refresh_token client_id=mobileV1 client_secret=abc123456 refresh_token=TOKEN
            request.post('http://localhost:1339/oauth/token', function (error, response, body){
                //res.send(JSON.parse(response.body));
                console.log('(2)response.body>>>');
                console.log(JSON.parse(response.body));
                //res.send(refresh_token);
                console.log('refresh_token: ' + refresh_token);
////////////////Главный токен (access_token) на всю сессию !!!!!!!!!!!!!!!!!!!!!!!!!!
                var access_token = JSON.parse(response.body).access_token;
                MAIN_TOKEN = access_token;
                console.log('MAIN token: ' + access_token);
                res.send(access_token);
            }).form({
                grant_type: 'refresh_token',
                client_id: 'mobileV1',
                client_secret: 'abc123456',
                refresh_token: refresh_token
            });
            //res.send(bodyParser.json(response.body));
        }).form({
            grant_type: 'password',
            client_id: 'mobileV1',
            client_secret: 'abc123456',
            username: 'andrey',
            password: 'simplepassword'
        });
});

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
app.get('/api/articles', passport.authenticate('bearer', { session: false }), function(req, res) {
    log.info("I want article");
    return ArticleModel.find(function (err, articles) {
        if (!err) {
            return res.send(articles);
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.send({ error: 'Server error' });
        }
    });
});

app.get('/api/organizations', passport.authenticate('bearer', { session: false }), function(req, res) {
    log.info("I want organization");
    return OrganizationModel.find(function (err, organizations) {
        if (!err) {
            return res.send(organizations);
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.send({ error: 'Server error' });
        }
    });
});

app.post('/api/articles', passport.authenticate('bearer', { session: false }), function(req, res) {
    var article = new ArticleModel({
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        images: req.body.images
    });

    article.save(function (err) {
        if (!err) {
            log.info("article created");
            return res.send({ status: 'OK', article:article });
        } else {
            console.log(err);
            if(err.name == 'ValidationError') {
                res.statusCode = 400;
                res.send({ error: 'Validation error' });
            } else {
                res.statusCode = 500;
                res.send({ error: 'Server error' });
            }
            log.error('Internal error(%d): %s',res.statusCode,err.message);
        }
    });
});

app.post('/api/organizations', passport.authenticate('bearer', { session: false }), function(req, res) {
console.log('New organization');
    var organization = new OrganizationModel({
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        nets: req.body.nets
    });

    organization.save(function (err) {
        if (!err) {
            log.info("organization created");
            return res.send({ status: 'OK', organization:organization });
        } else {
            console.log(err);
            if(err.name == 'ValidationError') {
                res.statusCode = 400;
                res.send({ error: 'Validation error' });
            } else {
                res.statusCode = 500;
                res.send({ error: 'Server error' });
            }
            log.error('Internal error(%d): %s',res.statusCode,err.message);
        }
    });
});

app.get('/test', function (req, res) {
    res.send('some_text');
});


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.get('/api', passport.authenticate('bearer', { session: false }), function (req, res) {
    res.send('API is running');
});

app.get('/api/articles', passport.authenticate('bearer', { session: false }), function(req, res) {
    log.info("I want article");
    return ArticleModel.find(function (err, articles) {
        if (!err) {
            return res.send(articles);
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.send({ error: 'Server error' });
        }
    });
});

app.post('/api/articles', passport.authenticate('bearer', { session: false }), function(req, res) {
    var article = new ArticleModel({
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        images: req.body.images
    });

    article.save(function (err) {
        if (!err) {
            log.info("article created");
            return res.send({ status: 'OK', article:article });
        } else {
            console.log(err);
            if(err.name == 'ValidationError') {
                res.statusCode = 400;
                res.send({ error: 'Validation error' });
            } else {
                res.statusCode = 500;
                res.send({ error: 'Server error' });
            }
            log.error('Internal error(%d): %s',res.statusCode,err.message);
        }
    });
});

app.get('/api/articles/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    return ArticleModel.findById(req.params.id, function (err, article) {
        if(!article) {
            res.statusCode = 404;
            return res.send({ error: 'Not found' });
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

// Редактирование
app.put('/api/articles/:id', passport.authenticate('bearer', { session: false }), function (req, res){
    return ArticleModel.findById(req.params.id, function (err, article) {
        if(!article) {
            res.statusCode = 404;
            return res.send({ error: 'Not found' });
        }

        article.title = req.body.title;
        article.description = req.body.description;
        article.author = req.body.author;
        article.images = req.body.images;
        return article.save(function (err) {
            if (!err) {
                log.info("article updated");
                return res.send({ status: 'OK', article:article });
            } else {
                if(err.name == 'ValidationError') {
                    res.statusCode = 400;
                    res.send({ error: 'Validation error' });
                } else {
                    res.statusCode = 500;
                    res.send({ error: 'Server error' });
                }
                log.error('Internal error(%d): %s',res.statusCode,err.message);
            }
        });
    });
});

// Удаление
app.delete('/api/articles/:id', passport.authenticate('bearer', { session: false }), function (req, res){
    return ArticleModel.findById(req.params.id, function (err, article) {
        if(!article) {
            res.statusCode = 404;
            return res.send({ error: 'Not found' });
        }
        return article.remove(function (err) {
            if (!err) {
                log.info("article removed");
                return res.send({ status: 'OK' });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.send({ error: 'Server error' });
            }
        });
    });
});

app.post('/oauth/token', oauth2.token);

app.get('/api/userInfo',
    passport.authenticate('bearer', { session: false }),
        function(req, res) {
            // req.authInfo is set using the `info` argument supplied by
            // `BearerStrategy`.  It is typically used to indicate scope of the token,
            // and used in access control checks.  For illustrative purposes, this
            // example simply returns the scope in the response.
            res.json({ user_id: req.user.userId, name: req.user.username, scope: req.authInfo.scope })
        }
);

app.get('/ErrorExample', function(req, res, next){
    next(new Error('Random error!'));
});

app.listen(config.get('port'), function(){
    log.info('Express server listening on port ' + config.get('port'));
});