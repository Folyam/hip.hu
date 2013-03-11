var redis = require("redis"),
    url = require('url');

var Rclient = null;

if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  Rclient = require('redis').createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
  Rclient.auth(redisURL.auth.split(":")[1]);
} else {
  Rclient = require("redis").createClient();
}

var StringUtils = require('../lib/stringutils');

exports.index = function(req, res, next) {
  if (!req.loggedIn) {
    return next();
  }

  var hash = StringUtils.generateRandom(40);

  Rclient.set("chat:auth:" + hash, JSON.stringify(req.session.user));

  res.render('chat/index', { hash: hash });
};