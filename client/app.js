var express = require('express');
var app = express();
var path = require('path');
var expressSession = require('express-session');
var expressHbs = require('express3-handlebars');

//var mongoUrl = 'mongodb://localhost:27017/dbname';
//var MongoStore = require('connect-mongo')(expressSession);
//var mongo = require('./mongo');

var port = 1338; // for heroku you would use process.env.PORT instead


console.log(__dirname);
console.log(path.join(__dirname, "static"));
app.use(express.static(path.join(__dirname, "static")));


// This is a middleware that we will use on routes where
// we _require_ that a user is logged in, such as the /secret url
function requireUser(req, res, next){
  if (!req.user) {
    res.redirect('/not_allowed');
  } else {
    next();
  }
}

// This middleware checks if the user is logged in and sets
// req.user and res.locals.user appropriately if so.
function checkIfLoggedIn(req, res, next){
  if (req.session.username) {
/*    var coll = mongo.collection('users');
    coll.findOne({username: req.session.username}, function(err, user){
      if (user) {
        // set a 'user' property on req
        // so that the 'requireUser' middleware can check if the user is
        // logged in
        req.user = user;
        
        // Set a res.locals variable called 'user' so that it is available
        // to every handlebars template.
        res.locals.user = user;
      }
      
      next();
    });*/
  } else {
    next();
  }
}

// Use this so we can get access to `req.body` in our posted login
// and signup forms.
app.use( require('body-parser')() );

// We need to use cookies for sessions, so use the cookie parser middleware
app.use( require('cookie-parser')() );

app.use( expressSession({
  secret: 'somesecretrandomstring',
 /* store: new MongoStore({
    url: mongoUrl
  })*/
}));

// We must use this middleware _after_ the expressSession middleware,
// because checkIfLoggedIn checks the `req.session.username` value,
// which will not be available until after the session middleware runs.
app.use(checkIfLoggedIn);

app.engine('hbs', expressHbs({extname:'hbs', defaultLayout:'main.hbs'}));
app.set('view engine', 'hbs');

app.get('/', function(req, res){
  //console.log('<<<<<WELCOME! Please, sign in or login>>>>>');
/*  var coll = mongo.collection('users');
  coll.find({}).toArray(function(err, users){
    res.render('index', {users:users});  
  })*/
});

app.get('/login', function(req, res){
  res.render('login');
});

app.get('/logout', function(req, res){
  delete req.session.username;
  res.redirect('/');
});

app.get('/not_allowed', function(req, res){
  res.render('not_allowed');
});

// The /secret url includes the requireUser middleware.
app.get('/secret', requireUser, function(req, res){
  res.render('secret');
});

app.get('/signup', function(req,res){
  res.render('signup');
});

function createSalt(){
  var crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

function createHash(string){
  var crypto = require('crypto');
  return crypto.createHash('sha256').update(string).digest('hex');
}

// This creates a new user and calls the callback with
// two arguments: err, if there was an error, and the created user
// if a new user was created.
//
// Possible errors: the passwords are not the same, and a user
// with that username already exists.
function createUser(username, password, password_confirmation, callback){
//  var coll = mongo.collection('users');
  
  if (password !== password_confirmation) {
    var err = 'The passwords do not match';
    callback(err);
  } else {
    var query      = {username:username};
    var salt       = createSalt();
    var hashedPassword = createHash(password + salt);
    var userObject = {
      username: username,
      salt: salt,
      hashedPassword: hashedPassword
    };
    
    // make sure this username does not exist already
/*    coll.findOne(query, function(err, user){
      if (user) {
        err = 'The username you entered already exists';
        callback(err);
      } else {
        // create the new user
        coll.insert(userObject, function(err,user){
          callback(err,user);
        });
      }
    });*/
  }
}

app.post('/signup', function(req, res){
  // The 3 variables below all come from the form
  // in views/signup.hbs
  var username = req.body.username;
  var password = req.body.password;
  var password_confirmation = req.body.password_confirmation;

console.log('recv_new_user_data');
console.log(username);
console.log(password);
console.log(password_confirmation);
  
  createUser(username, password, password_confirmation, function(err, user){
    if (err) {
      res.render('signup', {error: err});
    } else {
      
      // This way subsequent requests will know the user is logged in.
      req.session.username = user.username;
      
      res.redirect('/');  
    }
  });
});

// This finds a user matching the username and password that
// were given.
function authenticateUser(username, password, callback){
//  var coll = mongo.collection('users');
  
/*  coll.findOne({username: username}, function(err, user){
    if (err) {
      return callback(err, null);
    }
    if (!user) {
      return callback(null, null);
    }
    var salt = user.salt;
    var hash = createHash(password + salt);
    if (hash === user.hashedPassword) {
      return callback(null, user);
    } else {
      return callback(null, null);
    }
  });*/
}

app.post('/login', function(req, res){
  // These two variables come from the form on
  // the views/login.hbs page
  var username = req.body.username;
  var password = req.body.password;
  
  authenticateUser(username, password, function(err, user){
    if (user) {
      // This way subsequent requests will know the user is logged in.
      req.session.username = user.username;

      res.redirect('/');
    } else {
      res.render('login', {badCredentials: true});
    }
  });
});

/*Old static*/
//app.use('/public', express.static('public'));

/*
mongo.connect(mongoUrl, function(){
  console.log('Connected to mongo at: ' + mongoUrl);
  app.listen(port, function(){
    console.log('Server is listening on port: '+port);
  });  
})
*/

app.listen(port, function(){
    console.log('Server is listening on port: '+port);
    //log.info('Express server listening on port ' + port);
});