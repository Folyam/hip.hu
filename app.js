
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.SchemaTypes.ObjectId;


var db_uri = MONGOHQ_URL || "mongodb://localhost/hiphu";
mongoose.connect(db_uri);

var UserSchema = new Schema({
  id: 'string',
  email: 'string',
  name: 'string',
  given_name: 'string',
  family_name: 'string',
  link: 'string',
  picture: 'string',
  gender: 'string',
  birthday: 'string',
  locale: 'string'
}),
   User = mongoose.model('User', UserSchema);


var everyauth = require('everyauth');

var app = express();

everyauth.everymodule.logoutPath('/suicide');

everyauth.google
  .appId('1019384727458.apps.googleusercontent.com')
  .appSecret('m6xhdcdQfFqI-MzO69KL9Xd_')
  .scope('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email') // What you want access to
  .entryPath('/auth/google')
  .callbackPath('/auth/google/callback')
  //.handleAuthCallbackError( function (req, res) {
    // If a user denies your app, Google will redirect the user to
    // /auth/google/callback?error=access_denied
    // This configurable route handler defines how you want to respond to
    // that.
    // If you do not configure this, everyauth renders a default fallback
    // view notifying the user that their authentication failed and why.
  //})
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, googleUserMetadata) {
    var promise = this.Promise();

    User.findOne({id: googleUserMetadata.id}, function(err, user) {
      if (err) {
        return promise.fail(err);
      }
      if (!user) {
        var newuser = new User(googleUserMetadata);
        return User.create(newuser, function(err) {
          if (err) {
            return promise.fail(err);
          }

          return promise.fulfill(newuser);
        });
      }
      promise.fulfill(user);
    });
    return promise;
  })
  .redirectPath('/');
everyauth.everymodule.findUserById(function ( userId, callback ) {
  return User.findOne({id: userId}, function(err, user) {
    if (err) {
      return callback(err);
    }
    return callback(null, user);
  });
});

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('pramboshnypDicOmLertevNocgocUn'));
  app.use(express.session({secret: 'JefthileirrIpsIpHegMyDriheHaid'}));
  app.use(everyauth.middleware(app));
  app.use(app.router);
  app.use(function(req, res, next) {
    res.locals.version = "1.0";
    next();
  });
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

everyauth.helpExpress(app);
app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/jefDybNiOk8', routes.invite.first);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
