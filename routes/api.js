var mongoose = require('mongoose');
var Message = mongoose.model('Message'),
    User = mongoose.model('User'),
    Api = mongoose.model('Api');

// Intel API
exports.intel = {};
exports.intel.comm = function(req, res, next) {
  if (typeof req.query.key != "string") {
    return res.json({ error: "Access Denied!", message: "Please request an API key." });
  }

  var to, from;
  to   = new Date(parseInt(req.params.to, 10));
  from = new Date(parseInt(req.params.from, 10));

  var page = parseInt(req.params.page, 10) || 0;

  var now = new Date();
  if (isNaN(to.getTime())) {
    to = now;
  }
  if (isNaN(from.getTime())) {
    from = new Date(now.getTime() - (1000 * 60 * 60 * 24));
  }

  return Api.findOne({
    key: req.query.key
  }, function(err, api_access) {
    if (err || !api_access) {
      return res.json({ error: "Access Denied!", message: "Please request an API key." });
    }

    if (api_access.last_query.getDate() != (new Date().getDate())) {
      api_access.query_count = 0;
    } else {
      if (api_access.query_count >= api_access.query_limit) {
        return res.json({ error: "Access Denied!", message: "You have reached the limit (" + query_limit + ")." });
      }
    }

    api_access.query_count++;
    api_access.last_query = new Date();
    api_access.save();

    var query = Message.find({
      "type": "SYSTEM_BROADCAST",
      "private": false,
      "timestamp": {
        "$gt": from,
        "$lt": to
      }
    }).sort({"timestamp": -1});
    var LIMIT = 100;
    return query.limit(LIMIT).skip(LIMIT * page)
            .exec(function(err, messages) {
              if (err) {
                return res.json(err);
              }
              if (messages.length > 0) {
                res_to = messages[0].timestamp;
                res_from   = messages[messages.length -1].timestamp;
              } else {
                res_from = res_to = new Date();
              }

              return query.count(function(err, count) {
                if (err) {
                  return res.json(err);
                }
                return res.json({
                  info: {
                    response: {
                      from: res_from,
                      to: res_to,
                      length: messages.length,
                      total: count,
                      page: {
                        current: page,
                        max: Math.ceil(count/LIMIT) - 1 // because we count from 0
                      }
                    },
                    request: {
                      from: from,
                      to: to
                    }
                  },
                  messages: messages
                });
              });
            });
  });

};

// Profile API
exports.profile = {};
exports.profile.isInMyFaction = function(req, res, next) {
  if (!req.loggedIn) {
    return next();
  }
  if (typeof req.params.id != "string") {
    return next();
  }
  return User.count({ id: req.params.id, "agent.faction": req.session.user.agent.faction }, function(err, data) {
    if (err || data < 1) {
      return res.json({ isMyFaction: false });
    }

    return res.json({ isMyFaction: true });
  });
};