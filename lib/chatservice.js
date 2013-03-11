var IO = require('socket.io'),
    redis = require("redis"),
    url = require('url');

var Rclient = null;

if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  Rclient = require('redis').createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
  Rclient.auth(redisURL.auth.split(":")[1]);
} else {
  Rclient = require("redis").createClient();
}

var Client = function(client) {
  this.hash = null;
  this.codename = null;
  this.faction = null;
  this.stream = client;
};

Client.prototype.auth = function(callback) {
  var that = this;
  Rclient.get("chat:auth:" + this.hash, function(err, agent) {
    if (err) {
      return callback(err);
    }
    agent = JSON.parse(agent);
    if (!agent) {
      return callback("error");
    }
    try {
      that.codename = agent.agent.codename || null;
      that.faction = agent.agent.faction || null;
    } catch(e) {
      return callback("error2");
    }

    return callback();
  });
};

var ClientContainer = {
  clients: [],
  ioSocket: null,
  setSocket: function(socket) {
    this.ioSocket = socket;
    return this;
  },
  add: function(client) {
    this.clients.push(client);
    this.ioSocket.emit('client-container', { clients: this.clients });

    return true;
  },
  remove: function(client) {
    for (var i = 0, _l = this.clients.length; i < _l; i++) {
      if (client == this.clients[i]) {
        this.clients.splice(i, 1);
        this.ioSocket.emit('client-container', { clients: this.clients });
        return true;
      }
      return false;
    }
  }
};

var Server = function() {
  this.server = null;
};

Server.prototype.start = function(app) {
  if (this.server !== null) {
    return false;
  }

  this.server = IO.listen(app);

  var S = this.server;

  ClientContainer.setSocket(this.server);

  this.server.set("transports", ["xhr-polling"]);
  this.server.set("polling duration", 10);
  this.server.set("log level", 1);

  this.server.sockets.on('connection', function(socket) {
    var client = new Client();
    client.stream = socket;
    ClientContainer.add(client);

    var disconnectMe = function() {
      ClientContainer.remove(client);
      socket.disconnect();
      return false;
    };

    // handle disconnect
    socket.once('disconnect', function() {
      disconnectMe();
    });

    socket.on('auth', function(data) {
      client.hash = data.hash;

      client.auth(function(err) {
        if (err) {
          return disconnectMe();
        }

        client.stream.join("public");
        client.stream.emit("chat", { private: false, codename: "NIA", msg: "Publikus csatornára elérhető"});
        if (client.faction !== null) {
          client.stream.join(client.faction);
          client.stream.emit("chat", { private: true, codename: "NIA", msg: client.faction + " csatornára elérhető"});
        }
      });
    });

    // handle messages
    socket.on('chat', function(data) {
      var message = {
        codename: client.codename || "Anonymous",
        msg: data.msg,
        private: data.private
      };

      var target = (data.private && client.faction !== null ? client.faction : "public");
      S.sockets["in"](target).emit('chat', message);
    });
  });
};

exports.Client = Client;
exports.Server = Server;