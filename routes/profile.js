var mongoose = require('mongoose');
var User = mongoose.model('User');

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

    return res.render("profile/index", { user: user });
  });
};