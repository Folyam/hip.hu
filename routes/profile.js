var mongoose = require('mongoose');
var User = mongoose.model('User');
var Message = mongoose.model('Message');

var StringUtils = require('../lib/stringutils');

exports.index = function(req, res, next) {
  if (!req.loggedIn) {
    return next();
  }
  if (typeof req.params.id == "undefined") {
    req.params.id = req.user._id.toString();
  }
  User.findOne({_id: req.params.id}, function(err, user) {
    if (err) {
      console.log(err);
      return next();
    }

    if (typeof user.info.activation_code == "undefined") {
      return checkAndGenerateUniqActivationCode(StringUtils.generateActivationCode(15), function(err, code) {
        user.info.activation_code = code;
        return user.save(function(err, d) {
          return res.render("profile/index", { user: user });
        });
      });
    }

    return Message.find(
      {
        type: "SYSTEM_BROADCAST",
        private: false,
        "player.codename": user.agent.codename
      }
    ).limit(100).sort('-timestamp').exec(function(err, logs) {
      return res.render("profile/index", { user: user, logs: logs });
    });
  });
};

exports.save = function(req, res) {
  if (!req.loggedIn) {
    return next();
  }

  if (typeof req.body.name == "undefined" || typeof req.body.value == "undefined") {
    return res.json({error: "missing data", success: false});
  }

  var current = req.user;
  current.agent[req.body.name] = req.body.value;
  return current.save(function(err, d) {
    if (err) {
      return res.json({error: err, success: false});
    }

    return res.json({success: true, name: req.body.name, value: req.body.value});
  });
};

exports.faction = function(req, res) {
  if (!req.loggedIn) {
    return next();
  }

  return res.json({faction: req.user.agent.faction});
};

exports.isInMyFaction = function(req, res, next) {
  if (!req.loggedIn) {
    return next();
  }
  if (typeof req.params.id != "string") {
    return next();
  }
  return User.count({ id: req.params.id, "agent.faction": req.user.agent.faction }, function(err, data) {
    if (err || data < 1) {
      return res.json({ isMyFaction: false });
    }

    return res.json({ isMyFaction: true });
  });
}

var checkAndGenerateUniqActivationCode = function(code, callback) {
  User.count({info: { activation_code: code }}, function(err, data) {
    if (data < 1) {
      return callback(err, code);
    } else {
      return checkAndGenerateUniqActivationCode(StringUtils.generateActivationCode(15), callback);
    }
  });
}