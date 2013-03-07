var mongoose = require('../lib/mongodbsetup');

var Comm = require('./lib/comm'),
    async = require('async');

function main() {
  return Comm.sendRequest(Comm.generatePostData(), function(err, messages) {
    if (err) {
      return console.log('problem with request: ' + e.message);
    }
    return async.mapSeries(messages, Comm.checkMessage, function(err, m) {
      return Comm.execReduces(function() {
        return main();
      });
    });
  });
}

main();
