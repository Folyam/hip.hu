jQuery(document).ready(function() {

  var ChatApp = {};

  ChatApp.Models = {
    Message: null
  };

  ChatApp.Models.Message = (function(app) {
    var Message = function(msg) {
      this.text = msg;
    };

    return Message;
  })(ChatApp);

  ChatApp.MessagesHandler = (function(app) {
    var MessagesHandler = function(container) {
      this.container = container;
    };

    MessagesHandler.prototype.info = function(msg) {
      this.container.append(jQuery("<div class='info'>Info: " + msg + "</div>"));
      this.container.scrollTop(this.container[0].scrollHeight);
    };

    MessagesHandler.prototype.msg = function(msg) {
      this.container.append(jQuery("<div class='msg'><span>" + msg.codename + ":</span> " + msg.msg + "</div>"));
      this.container.scrollTop(this.container[0].scrollHeight);
    };

    return MessagesHandler;
  })(ChatApp);

  (function(app) {
    var socket = io.connect("/");
    var logger = new app.MessagesHandler(jQuery('#log'));
    var public = new app.MessagesHandler(jQuery('#public'));
    var faction = new app.MessagesHandler(jQuery('#faction'));

    socket.on('connect', function() {
      logger.info("Connected");
      var myHash = jQuery('#myhash').val();

      socket.emit('auth', { hash: myHash });
    });

    socket.on('chat', function (data) {
      if (data.private) {
        faction.msg(data);
      } else {
        public.msg(data);
      }
    });

    socket.on('client-count', function (data) {
      jQuery("#" + data.channel).parent().find('h2 span').text(" (" + data.count + " ügynök van jelen)");
    });

    jQuery('input[name="public"], input[name="faction"]').on('keydown', function(e) {
      var message = jQuery(this).val();

      if (e.which == 13 && message && socket.socket.connected) {
        socket.emit('chat', {
          msg: message,
          private: jQuery(this).data("private")
        });
        jQuery(this).val('');
      }
    });

  })(ChatApp);

});
