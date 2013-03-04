var mongoose = require('../lib/mongodbsetup');

var Comm = require('./lib/comm'),
    async = require('async');

function main() {
  return Comm.sendRequest(Comm.generatePostData(), function(err, messages) {
    if (err) {
      return console.log('problem with request: ' + e.message);
    }
    return async.map(messages, Comm.checkMessage, function(m) {
      return main();
      //mongoose.disconnect();
    });
    // for(var i in messages) {
    //   if (!messages.hasOwnProperty(i)) {
    //     continue;
    //   }
    //   Comm.checkMessage(messages[i]);
    // }
    // return true;
  });
}

main();
