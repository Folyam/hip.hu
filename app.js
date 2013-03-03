
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    RedisStore = require('connect-redis')(express),
    url = require('url');

var redisURL, rclient;
if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  rclient = require('redis').createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
  rclient.auth(redisURL.auth.split(":")[1]);
} else {
  rclient = require("redis").createClient();
}
var SessionStore = new RedisStore({client: rclient});

var mongoose = require('mongoose');

var db_uri = process.env.MONGOHQ_URL || "mongodb://localhost/hiphu";
mongoose.connect(db_uri);

var models_path = __dirname + '/lib/models';
fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file);
});

var routes = require('./routes');

var everyauth = require('everyauth');

var app = express();

everyauth.everymodule.logoutPath('/suicide');

var User = mongoose.model('User');

var _google = {
  appId: process.env.GoogleAppId,
  secret: process.env.GoogleSecret
};

everyauth.google
  .appId(_google.appId)
  .appSecret(_google.secret)
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
        googleUserMetadata.info = {
          last_ip: session.ip
        };
        //user.info.last_ip = session.ip;
        googleUserMetadata.agent = {
          codename: null,
          faction: null,
          level: null,
          city: null
        };
        var newuser = new User(googleUserMetadata);
        return User.create(newuser, function(err) {
          if (err) {
            return promise.fail(err);
          }

          return promise.fulfill(newuser);
        });
      }

      user.info.last_ip = session.ip;
      if (typeof user.agent.codename == "undefined") {
        user.agent = {
          codename: null,
          faction: null,
          level: null,
          city: null
        };
      }
      return user.save(function(err, s) {
        return promise.fulfill(user);
      });
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

// snippet taken from http://catapulty.tumblr.com/post/8303749793/heroku-and-node-js-how-to-get-the-client-ip-address
var getClientIp = function (req) {
  var ipAddress;
  // The request may be forwarded from local web server.
  var forwardedIpsStr = req.header('x-forwarded-for');
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    // If request was not forwarded
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};
// snippet end

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('pramboshnypDicOmLertevNocgocUn'));
  app.use(express.session({
    secret: 'JefthileirrIpsIpHegMyDriheHaid',
    maxAge : (new Date()) + 86400000, // 2h Session lifetime
    store: SessionStore
  }));
  app.use(function(req, res, next) {
    req.session.ip = getClientIp(req);
    return next();
  });
  app.use(everyauth.middleware(app));
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

//everyauth.helpExpress(app);
app.configure('development', function(){
  app.use(express.errorHandler());
});

// root
app.get('/', routes.index);
// profile
app.get('/me', routes.profile.index);
app.get('/me/faction.json', routes.profile.faction);
app.post('/me/save', routes.profile.save);
app.get('/api/profile/:id.json', routes.profile.isInMyFaction);
// app.get('/u/:id', routes.profile.index);
// intel
app.get('/intel/comm', routes.intel.comm);
// invite
app.get('/jefDybNiOk8', routes.invite.first);
app.get('/Lyctofcaff', routes.invite.second);
app.get('/berAcsOots', routes.invite.third);

app.locals.Version = "0.3.5";
app.locals.Page = {
  long: "Hungarian Ingress Players",
  short: "hip"
};
app.locals.GooglePlus = {
  pageId: "106189462161250574504",
  communityId: "109012576581831848926",
  factions: {
    "Resistance": "111411442712848944778",
    "Enlightened": "110165515317838688784"
  }
};

app.use(function(req, res, next){
  res.status(404);
  res.render(
    'error/404',
    {
      method: req.method,
      path: req.path
    }
  );
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


// Link schema
// http://www.ingress.com/intel?latE6=47684459&lngE6=17638035&z=18
// http://maps.googleapis.com/maps/api/js/GeocodeService.Search?4sBisinger%20s%C3%A9t%C3%A1ny&7sUS&9sen-US&callback=_xdc_._5v521y&token=44543
