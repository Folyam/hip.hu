
/*
 * GET home page.
 */

exports.index = function(req, res){
  var start   = 1359972947375;
  var end     = 1360080047375;
  var current = new Date().getTime();

  var percentage = (1-((end-current)/(end-start)))*100;

  res.render('index', { percentage: percentage });
};
exports.error404 = function(req, res) {
  res.render('404', { title: 'Hip.hu' });
};

exports.profile = require('./profile');
exports.intel = require('./intel');
exports.invite = require('./invite');