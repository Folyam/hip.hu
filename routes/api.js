var mongoose = require('mongoose');
var Message = mongoose.model('Message');

// Intel API
exports.intel = {};
exports.intel.comm = function(req, res, next) {
  var to, from;
  to   = new Date(req.params.to);
  from = new Date(req.params.from);

  var now = new Date();
  if (isNaN(to.getTime())) {
    to = now;
  }
  if (isNaN(from.getTime())) {
    from = new Date(now.getTime() - (1000 * 60 * 60 * 24));
  }

  var query = Message.find({
    "type": "SYSTEM_BROADCAST",
    "private": false,
    "timestamp": {
      "$gt": from,
      "$lt": to
    }
  }).sort({"timestamp": -1});
  return query.limit(100)
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
                    total: count
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