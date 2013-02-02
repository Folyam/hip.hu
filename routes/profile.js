var mongoose = require('mongoose');
var User = mongoose.model('User');

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

    return res.render("profile/index", { user: user });
  });
};

var checkAndGenerateUniqActivationCode = function(code, callback) {
  User.count({info: { activation_code: code }}, function(err, data) {
    if (data < 1) {
      return callback(err, code);
    } else {
      return checkAndGenerateUniqActivationCode(StringUtils.generateActivationCode(15), callback);
    }
  });
}