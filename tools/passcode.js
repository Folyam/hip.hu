var http = require('http');
var util = require('util');

var ACSID = process.env.ACSID;
var csrftoken = process.env.csrftoken;

console.log(ACSID);

var options = {
  hostname: "www.ingress.com",
  port: 80,
  path: "/rpc/dashboard.redeemReward",
  method: "POST"
};

function sendRequest(data, callback) {
  var req = http.request(options, function(res) {
    var ResData = "";
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      ResData += chunk;
    });
    res.on('end', function() {
      try {
        var List = JSON.parse(ResData);
        return callback(null, List);
      } catch (e) {
        if (ResData.match(/NIA takedown in progress. Stand by./)) {
          return callback({message: "NIA takedown in progress. Stand by."});
        }
        return callback(e);
      }
    });
  });
  req.setHeader("Content-Type", "application/json; charset=UTF-8");
  req.setHeader("X-Requested-With", "XMLHttpRequest");
  req.setHeader("X-CSRFToken", csrftoken);
  req.setHeader("Cookie", "ACSID=" + ACSID + "; csrftoken=" + csrftoken + ";");

  req.on('error', function(e) {
    callback(e, null);
  });
  req.write(JSON.stringify(data));

  return req.end();
}

function generatePostData(passcode) {
  return {
    "passcode": passcode,
    "method": "dashboard.redeemReward"
  };
}

function main() {
  // var passcode = "8tb4dalbyt6v2t";
  var passcode = "9yb2patternx8q8z";
  var data = generatePostData(passcode);
  return sendRequest(data, function(err, messages) {
    if (err) {
      return console.log('problem with request: ' + err.message);
    }
    return console.log(util.inspect(messages, false, 7, false));
  });
}

main();