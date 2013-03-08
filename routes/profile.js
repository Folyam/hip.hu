var mongoose = require('mongoose'),
    OAuth2 = require('oauth').OAuth2,
    User = mongoose.model('User'),
    Message = mongoose.model('Message'),
    StringUtils = require('../lib/stringutils');

exports.index = function(req, res, next) {
  if (!req.loggedIn) {
    return next();
  }
  if (typeof req.params.id == "undefined") {
    req.params.id = req.session.user._id.toString();
  }
  User.findOne({_id: req.params.id}, function(err, user) {
    if (err) {
      console.log(err);
      return next();
    }

    if (typeof user.info.activation_code == "undefined") {
      return checkAndGenerateUniqActivationCode(StringUtils.generateRandom(15), function(err, code) {
        user.info.activation_code = code;
        return user.save(function(err, d) {
          if (err) {
            console.log(user);
          }
          return res.render("profile/index", { user: user, logs: [] });
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

  var current = req.session.user;
  current.agent[req.body.name] = req.body.value;
  console.log(current);
  return current.save(function(err, d) {
    if (err) {
      return res.json({error: err, success: false});
    }

    return res.json({success: true, name: req.body.name, value: req.body.value});
  });
};

exports.faction = function(req, res, next) {
  if (!req.loggedIn) {
    return next();
  }

  return res.json({faction: req.session.user.agent.faction});
};

exports.isInMyFaction = function(req, res, next) {
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

exports.auth = function(req, res, next) {
  if (req.session.state !== req.body.state) {
    console.log(req.session.state,req.body.state);
    return res.json({
      error: true
    });
  }

  var code = req.body.code,
      guid = req.body.user_id;

  validateAndAdd(code, guid, req.session.ip, function(err, data) {
    req.session.user = data;
    res.json({
      error: err,
      user: data
    });
  });
  //req.session.state = null;
  return true;
};

var c_googleapi = require('../etc/googleapi');

var checkAndGenerateUniqActivationCode = function(code, callback) {
  User.count({info: { activation_code: code }}, function(err, data) {
    if (data < 1) {
      return callback(err, code);
    } else {
      return checkAndGenerateUniqActivationCode(StringUtils.generateRandom(15), callback);
    }
  });
};

var validateAndAdd = function(code, guid, ip, callback) {
  var oa2 = new OAuth2(
    c_googleapi.webapp.ClientId,
    c_googleapi.webapp.ClientSecret,
    c_googleapi.webapp.Basic,
    c_googleapi.webapp.AuthUri,
    c_googleapi.webapp.TokenUri
  );
  return oa2.getOAuthAccessToken(
    code,
    {
      grant_type: "authorization_code",
      redirect_uri: "postmessage",
      scope: "https://www.googleapis.com/auth/plus.login"
    },
    function(err, access_token) {
      return oa2.get("https://www.googleapis.com/plus/v1/people/me", access_token, function(err, profile) {
        if (err) {
          return callback(err);
        }
        try {
          profile = JSON.parse(profile);
        } catch(e) {
          return callback(e);
        }
        return User.findOne({id: profile.id}, function(err, resp) {
          if (err) {
            return callback(err);
          }
          if (resp === null) {
            var newuser = new User(profile);
            newuser.info.last_ip = ip;
            newuser.agent = {
              codename: null,
              faction: null,
              level: null
            };
            return User.create(newuser, function(err) {
              if (err) {
                return callback(err);
              }

              return callback(null, newuser);
            });
          }
          // if the user has only the old structured entry
          if (typeof resp.aboutMe == "undefined") {
            // save old structured user entry
            var old = resp;
            return resp.remove(function(err, d) {
              var newuser = new User(profile);
              // restore old info + agent
              newuser.info = old.info;
              newuser.agent = old.agent;

              // update current ip
              newuser.info.last_ip = ip;
              return User.create(newuser, function(err) {
                if (err) {
                  return callback(err);
                }

                return callback(null, newuser);
              });
            });
          }
          resp.info.last_ip = ip;
          return resp.save(function() {
            return callback(null, resp);
          });
        });
      });
    }
  );
};

