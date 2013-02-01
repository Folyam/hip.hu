
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Hip.hu' });
};
exports.error404 = function(req, res) {
  res.render('404', { title: 'Hip.hu' });
};

exports.profile = require('./profile');
exports.intel = require('./intel');
exports.invite = require('./invite');