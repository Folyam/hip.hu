
/*
 * GET home page.
 */

var mongoose = require('mongoose');
var StatLevel = mongoose.model('StatLevel');

exports.index = function(req, res){
  var start   = 1359972947375;
  var end     = 1360080047375;
  var current = new Date().getTime();

  var percentage = (1-((end-current)/(end-start)))*100;

  return StatLevel.find({}, function(err, list) {
    return res.render('index', { statLevels: list });
  });
};
exports.error404 = function(req, res) {
  res.render('404', { title: 'Hip.hu' });
};

exports.profile = require('./profile');
exports.intel = require('./intel');
exports.invite = require('./invite');
exports.chat = require('./chat');