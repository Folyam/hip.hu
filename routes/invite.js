var CryptUtils = require('../lib/cryptutils');

var encoded = {
  first: (function() {
    var code = 'EZX39F4P';
    var encoded = '________';

    encoded = CryptUtils.caesar(code, 1);
    encoded = CryptUtils.toMorseCode(encoded)
              .replace(/_/g, '=')
              .replace(/\./g, "-");
    encoded = "Viva la resistance! Support is necessary! If you know this code W4L%7C*H then you may join us: " + encoded + "! Please help!";
    encoded = (new Buffer(encoded)).toString('base64');
    binaryFormat = CryptUtils.stringToBinary(encoded);
    var temp = '';
    for(var i = 0, _l = binaryFormat.length; i < _l; i++) {
      temp += binaryFormat[i] + " ";
      if (i > 0 && (i+1) % 13 == 0) {
        temp += "\n";
      }
    }
    //encoded = binaryFormat.join(' ')
    encoded = temp
                          .replace(/0/g, '[')
                          .replace(/1/g, ']')
    ;

    return encoded;
  })()
};


exports.first = function(req, res) {
  if (!req.loggedIn) {
    return res.end('Cannot ' + req.route.method.toUpperCase() + ' ' + req.route.path);
  }

  res.render('invite/first.jade', { code: encoded.first });
}