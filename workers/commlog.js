var http = require('http');
var util = require('util');

var ACSID = process.env.ACSID;
var csrftoken = process.env.csrftoken;


var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.SchemaTypes.ObjectId;

var db_uri = process.env.MONGOHQ_URL || "mongodb://localhost/hiphu";
mongoose.connect(db_uri);

require('../lib/models/message');
require('../lib/models/user');
var Message = mongoose.model('Message');
var User = mongoose.model('User');
var options = {
  hostname: "www.ingress.com",
  port: 80,
  path: "/rpc/dashboard.getPaginatedPlextsV2",
  method: "POST"
};

var TEAMS = {
  "NEUTRAL": "Neutral",
  "RESISTANCE": "Resistance",
  "ALIENS": "Enlightened"
}

function parsePlext(id, timestamp, plext) {
  var MessageObject = new Message;

  MessageObject.guid       = id;
  MessageObject.timestamp = new Date(timestamp);
  MessageObject.text      = plext.text;
  MessageObject.type      = plext.plextType;
  MessageObject.team      = TEAMS[plext.team];
  MessageObject.portals   = [];
  MessageObject.plain     = [];
  MessageObject.private   = false;
  MessageObject.player    = {};

  for(var index in plext.markup) {
    if (plext.markup[index][0] == "PLAYER") {
      MessageObject.player = {
        guid: plext.markup[index][1].guid,
        codename: plext.markup[index][1].plain,
        team: TEAMS[plext.markup[index][1].team]
      }
      continue;
    }
    if (plext.markup[index][0] == "PORTAL") {
      MessageObject.portals.push({
        guid: plext.markup[index][1].guid,
        name: plext.markup[index][1].name,
        team: TEAMS[plext.markup[index][1].team],
        location: {
          latE6: plext.markup[index][1].latE6,
          lngE6: plext.markup[index][1].lngE6,
          lat: plext.markup[index][1].latE6/1000000,
          lng: plext.markup[index][1].lngE6/1000000,
          address: plext.markup[index][1].address
        }
      });
      continue;
    }
    if (plext.markup[index][0] == "TEXT") {
      MessageObject.plain.push(plext.markup[index][1].plain);
      continue;
    }
    if (plext.markup[index][0] == "SECURE") {
      MessageObject.private = true;
      continue;
    }
    if (plext.markup[index][0] == "SENDER") {
      MessageObject.player = {
        guid: plext.markup[index][1].guid,
        codename: plext.markup[index][1].plain,
        team: TEAMS[plext.markup[index][1].team]
      };
      continue;
    }
  }

  return MessageObject;
}


function sendRequest(data, callback) {
  var req = http.request(options, function(res) {
    var ResData = "";
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      ResData += chunk;
    });
    res.on('end', function() {
      var List = JSON.parse(ResData);
      var messages = [];
      for (var index in List.result) {
        var message = parsePlext(List.result[index][0], List.result[index][1], List.result[index][2].plext);
        messages.push(message);
      }
      callback(null, messages);
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

function getToday() {
  var currentTime = new Date();
  var y = currentTime.getFullYear();
  var m = currentTime.getMonth() + 1;
  if (m < 10) {
    m = "0" + m;
  }
  var d = currentTime.getDate();
  return new Date("" + y + "-" + m  + "-" + d);
}

function saveLastDeployLevel(message) {
  if (message.type !== "SYSTEM_BROADCAST") {
    return false;
  }

  if (message.plain[0] !== " deployed an ") {
    return false;
  }

  var level = parseInt(message.plain[1].replace(/L/, ""));
  console.log(message.player.codename, level);

  return User.findOne({
    "agent.codename": message.player.codename,
    "$or": [
      {"agent.level": { "$lt": level }},
      {"agent.level": null}
    ]
  }, function(err, u) {
    if (err) {
      return false;
    }
    if (u) {
      u.agent.level = level;
      return u.save(function(err, data) {
      });
    }

    return false;
  });
}

function checkAndSaveValidation(message) {
  if (message.type !== "PLAYER_GENERATED") {
    return false;
  }

  var match = message.plain[0].match(/^Azonosítom magam a hip.hu oldalon: ([a-zA-Z0-9]+)$/);
  if (!match) {
    return false;
  }

  return User.findOne({
    "agent.codename": message.player.codename.replace(/: $/, ""),
    "info.activation_code": match[1],
    "agent.faction": null
  }, function(err, u) {
    if (err) {
      return false;
    }
    if (u) {
      u.agent.faction = message.team;
      return u.save(function(err, data) {
      });
    }

    return false;
  });
}

function saveMessageToDatabase(message, callback) {
  return Message.findOne({ guid: message.guid }, function(err, m) {
    if (!m) {
      checkAndSaveValidation(message);
      saveLastDeployLevel(message);
      if (message.type === "PLAYER_GENERATED") {
        return false;
      }
      //return message.save(callback);
      return callback("not saved currently", message);
    }
    return callback("exists", message);
  });
}

var WAITING = 20;

function generatePostData(endTimestamp) {
  if (typeof endTimestamp == "undefined") {
    var current = new Date();
    endTimestamp = current.getTime();
  }
  return {
    "desiredNumItems": 50,
    "minLatE6": 45629405,
    "minLngE6": 16018066,
    "maxLatE6": 48661943,
    "maxLngE6": 23071289,
    "minTimestampMs": endTimestamp - ((WAITING * 5) * 1000),
    "maxTimestampMs": endTimestamp,
    "method": "dashboard.getPaginatedPlextsV2"
  };
}

function main() {
  var data = generatePostData();
  return sendRequest(data, function(err, messages) {
    if (err) {
      return console.log('problem with request: ' + e.message);
    }
    for(var i in messages) {
      saveMessageToDatabase(messages[i], function(err, d) {
        if (err) {
          return true; // console.log("" + d._id + " exists");
        }
        return true; // console.log("" + d._id + " saved");
      });
    }
    //return console.log(util.inspect(messages, false, 7, false));
  });
}

main();
setInterval(main, WAITING * 1000);

// Azonosítom magam a hip.hu oldalon: sIyp66JoOeDIFpC
