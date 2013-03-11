var redis = require("redis"),
    Rclient = redis.createClient();


var StringUtils = require('../lib/stringutils');

exports.index = function(req, res, next) {
  if (!req.loggedIn) {
    return next();
  }

  var hash = StringUtils.generateRandom(40);

  Rclient.set("chat:auth:" + hash, JSON.stringify(req.session.user));

  res.render('chat/index', { hash: hash });
};