var mongoose = require('mongoose');
var Message = mongoose.model('Message');

exports.comm = function(req, res) {
  Message.find({"type": "SYSTEM_BROADCAST", "private": false}, function(err, messages) {
    if (err) {
      return res.json(err);
    }

    return res.json({ length: messages.length, messages: messages });
  });
};