var mongoose = require('../lib/mongodbsetup');

var Comm = require('./lib/comm'),
    async = require('async');

var lastReduceRun = 0;

function main() {
  return Comm.sendRequest(Comm.generatePostData(), function(err, messages) {
    if (err) {
      return console.log('problem with request: ' + e.message);
    }
    return async.mapSeries(messages, Comm.checkMessage, function(err, m) {
      if (lastReduceRun++ > 3) {
        console.log("ok");
        return Comm.execReduces(function(err, res) {
          console.log(err);
          lastReduceRun = 0;
          return main();
        });
      } else {
        return main();
      }
    });
  });
}

main();
