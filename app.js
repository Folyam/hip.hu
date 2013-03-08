
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    RedisStore = require('connect-redis')(express),
    url = require('url'),
    StringUtils = require('./lib/stringutils');

var redisURL, rclient;
if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  rclient = require('redis').createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
  rclient.auth(redisURL.auth.split(":")[1]);
} else {
  rclient = require("redis").createClient();
}
var SessionStore = new RedisStore({client: rclient});


var mongoose = require('./lib/mongodbsetup'),
    routes = require('./routes'),
    User = mongoose.model('User');

var app = express();

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
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(req, res, next) {
    req.session.ip = getClientIp(req);
    if (typeof req.session.state == "undefined" || req.session.state === null) {
      res.locals.state = StringUtils.generateRandom(20);
      req.session.state = res.locals.state;
    } else {
      res.locals.state = req.session.state;
    }
    return next();
  });
  app.use(function(req, res, next) {
    if (typeof req.session.user != "undefined" && req.session.user) {
      return User.findOne({_id: req.session.user._id}, function(err, u) {
        req.session.user = u;
        res.locals.current = u;
        res.locals.isLoggedIn = true;
        req.loggedIn = true;
        return next();
      });
    } else {
      res.locals.current = new User();
      res.locals.isLoggedIn = false;
      req.loggedIn = false;
    }
    return next();
  });
  app.use(app.router);
});

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
app.post('/user/auth', routes.profile.auth);
app.get('/suicide', function(req, res) {
  delete req.session.user;
  return res.redirect("/");
});
// app.get('/u/:id', routes.profile.index);
// intel
app.get('/intel/comm', routes.intel.comm);
// invite
app.get('/jefDybNiOk8', routes.invite.first);
app.get('/Lyctofcaff', routes.invite.second);
app.get('/berAcsOots', routes.invite.third);

var c_app = require('./etc/app'),
    c_social = require('./etc/social'),
    c_googleapi = require("./etc/googleapi");

app.locals.Version = c_app.version;
app.locals.Page = c_app.Page;
app.locals.GooglePlus = c_social.GooglePlus;
app.locals.GoogleAPI = c_googleapi;

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
