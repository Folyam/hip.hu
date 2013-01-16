
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Hip.hu' });
};
exports.error404 = function(req, res) {
  res.render('404', { title: 'Hip.hu' });
};

exports.invite = require('./invite');