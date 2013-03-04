var http = require('http'),
    util = require('util'),
    mongoose = require('mongoose'),
    async = require('async');

// Session data from ENV
var ACSID = process.env.ACSID,
    csrftoken = process.env.csrftoken;

// Load models
var Message = mongoose.model('Message');
var User = mongoose.model('User');
var Level = mongoose.model('Level');

// Connection options
var options = {
  hostname: "www.ingress.com",
  port: 80,
  path: "/rpc/dashboard.getPaginatedPlextsV2",
  method: "POST"
};

// Team aliasing
var TEAMS = {
  "NEUTRAL": "Neutral",
  "RESISTANCE": "Resistance",
  "ALIENS": "Enlightened"
};

var WAITING = 20;

var parsePlext = function(id, timestamp, plext) {
  var MessageObject = new Message();

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
      };
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
};

var sendRequest = function(data, callback) {
  var req = http.request(options, function(res) {
    var ResData = "";
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      ResData += chunk;
      return true;
    });
    res.on('end', function() {
      var List = JSON.parse(ResData);
      var messages = [];
      for (var index in List.result) {
        var message = parsePlext(List.result[index][0], List.result[index][1], List.result[index][2].plext);
        messages.push(message);
      }
      return callback(null, messages);
    });
  });
  req.setHeader("Content-Type", "application/json; charset=UTF-8");
  req.setHeader("X-Requested-With", "XMLHttpRequest");
  req.setHeader("X-CSRFToken", csrftoken);
  req.setHeader("Cookie", "ACSID=" + ACSID + "; csrftoken=" + csrftoken + ";");

  req.on('error', function(e) {
    return callback(e, null);
  });
  req.write(JSON.stringify(data));

  return req.end();
};

var saveLastDeployLevel = function(message, callback) {
  if (message.type !== "SYSTEM_BROADCAST") {
    return callback(null, message);
  }

  if (message.plain[0] !== " deployed an ") {
    return callback(null, message);
  }

  var level = parseInt(message.plain[1].replace(/L/, ""), 10);

  return User.findOne({
    "agent.codename": message.player.codename,
    "$or": [
      {"agent.level": { "$lt": level }},
      {"agent.level": null}
    ]
  }, function(err, u) {
    if (err) {
      return callback(null, message);
    }
    if (u) {
      u.agent.level = level;
      return u.save(function(err, data) {
        return callback(null, message);
      });
    }

    return callback(null, message);
  });
};

var saveLevelForAll = function(message, callback) {
  if (message.type !== "SYSTEM_BROADCAST") {
    return callback(null, message);
  }

  if (message.plain[0] !== " deployed an ") {
    return callback(null, message);
  }

  var level = parseInt(message.plain[1].replace(/L/, ""), 10);

  return Level.findOne({
    "codename": message.player.codename
  }, function(err, l) {
    if (err) {
      return callback(null, message);
    }
    if (!l) {
      l = new Level({
        "codename": message.player.codename,
        "level": level,
        "faction": message.team
      });
    } else {
      if (l.level < level) {
        l.level = level;
      }

      if (l.hasOwnProperty('faction') || l.faction === null || typeof l.faction == "undefined") {
        l.faction = message.team;
      }
    }
    l.timestamp = message.timestamp;

    return l.save(function(err, data) {
      return callback(null, message);
    });
  });
};

var checkAndSaveValidation = function(message, callback) {
  if (message.type !== "PLAYER_GENERATED") {
    return callback(null, message);
  }

  var match = message.plain[0].match(/^Azonosítom magam a hip.hu oldalon: ([a-zA-Z0-9]+)$/);
  if (!match) {
    return callback(null, message);
  }

  return User.findOne({
    "agent.codename": message.player.codename.replace(/: $/, ""),
    "info.activation_code": match[1],
    "agent.faction": null
  }, function(err, u) {
    if (err) {
      return callback(null, message);
    }
    if (u) {
      u.agent.faction = message.team;
      return u.save(function(err, data) {
        return callback(null, message);
      });
    }

    return callback(null, message);
  });
};

var checkMessage = function(message, callback) {
  return async.applyEach(
    [
      checkAndSaveValidation,
      saveLastDeployLevel,
      saveLevelForAll
    ],
    message,
    function(err, res) {
      callback(null, message);
    }
  );
//  var callList = async.compose(
//    checkAndSaveValidation,
//    saveLastDeployLevel,
//    saveLevelForAll
//  );
//  callList(message, function(err, res) {
//    callback(null, message);
//  });
};

var generatePostData = function(endTimestamp) {
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
};

module.exports.parsePlext = parsePlext;
module.exports.sendRequest = sendRequest;
module.exports.saveLastDeployLevel = saveLastDeployLevel;
module.exports.checkAndSaveValidation = checkAndSaveValidation;
module.exports.generatePostData = generatePostData;
module.exports.checkMessage = checkMessage;
