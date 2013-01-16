var CryptUtils = require('../lib/cryptutils');
var Png = require('png').Png;

function calculatePixel(width, height, line, column) {
  var length, _line;
  length = width*height*3;
  _line = length / width;
  _column = _line / height;

  return _line*line + _column*column;
}

function fillPixel(buffer, position, color) {
  for (var i = 0; i < 3; i++) {
    buffer[position + i] = color[i];
  }

  return buffer;
}

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
  })(),
  second: (function() {
    var code = "Invite Code: RRYHC2CT";
    var encoded = code.replace(/./g, '_');

    encoded = (new Buffer(code)).toString('base64');
    encoded = CryptUtils.caesar(encoded, 12) + 'Lyctofcaff+CaesarSqrt144==';

    var width = 256, height = 256;

    var base = new Buffer(encoded);
    var buffer = new Buffer(width*height*3);

    for(var i = 0, _l = buffer.length; i < _l; i++) {
      buffer[i] = 0;
    }

    for(var i = 0, _l = base.length; i < _l; i++) {
      buffer[i] = base[i];
    }

    var position = 0;
    var line = buffer.length/width;

    //position = calculatePixel(width, height, 2, height/2);    fillPixel(buffer, position, [255, 255, 255]);
    //position = calculatePixel(width, height, 3, height/2);    fillPixel(buffer, position, [255, 255, 255]);
    //position = calculatePixel(width, height, 4, height/2);    fillPixel(buffer, position, [255, 255, 255]);

    for(var i = 0; i < height/3-3; i++) {
      for(var j = -1; j < 2; j++) {
        position = calculatePixel(width, height, i+2, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+3, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+4, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+2, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+3, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+4, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
      }
    }

    for(var i = height; i > height/3*2+3; i--) {
      for(var j = -1; j < 2; j++) {
        position = calculatePixel(width, height, i+2, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+3, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+4, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+2, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+3, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+4, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
      }
    }

    for(var i = height/3-3; i < height/3*2+3; i++) {
      for(var j = width/6-3; j < width/6; j++) {
        position = calculatePixel(width, height, i+2, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+4, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+6, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+2, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+4, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+6, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
      }
    }

    for(var i = height/3-3; i < height/3*2+3; i++) {
      for(var j = width/2-3; j < width/2; j++) {
        position = calculatePixel(width, height, i-2, height/2+i+j);  fillPixel(buffer, position, [(255-i*j)%255, 0, 0]);
        position = calculatePixel(width, height, i-4, height/2+i+j);  fillPixel(buffer, position, [100, (255-i*j)%255, 100]);
        position = calculatePixel(width, height, i-6, height/2+i+j);  fillPixel(buffer, position, [134, 122, (255-i*j)%255]);
        position = calculatePixel(width, height, i-2, height/2-i-j);  fillPixel(buffer, position, [(255-i*j)%255, 100, 124]);
        position = calculatePixel(width, height, i-4, height/2-i-j);  fillPixel(buffer, position, [(255-i+2*j)%255, 223, (255-i*j)%255]);
        position = calculatePixel(width, height, i-6, height/2-i-j);  fillPixel(buffer, position, [98, (255-i*j)%255, 144]);
      }
    }

    for(var i = height/3-3; i < height/3*2+3; i++) {
      for(var j = width/2-3; j < width/2; j++) {
        position = calculatePixel(width, height, i-2, height/2+i+j);  fillPixel(buffer, position, [(255-i*j)%255, 0, 0]);
        position = calculatePixel(width, height, i-4, height/2+i+j);  fillPixel(buffer, position, [100, (255-i*j)%255, 100]);
        position = calculatePixel(width, height, i-6, height/2+i+j);  fillPixel(buffer, position, [134, 122, (255-i*j)%255]);
        position = calculatePixel(width, height, i-2, height/2-i-j);  fillPixel(buffer, position, [(255-i*j)%255, 100, 124]);
        position = calculatePixel(width, height, i-4, height/2-i-j);  fillPixel(buffer, position, [(255-i+2*j)%255, 223, (255-i*j)%255]);
        position = calculatePixel(width, height, i-6, height/2-i-j);  fillPixel(buffer, position, [98, (255-i*j)%255, 144]);
      }
    }

    var dynamic_png = new Png(buffer, width, height, "rgb");
    encoded = dynamic_png.encodeSync().toString('base64');

    return encoded;
  })()
};

exports.first = function(req, res, next) {
  if (!req.loggedIn) {
    return next();
  }

  res.render('invite/first.jade', { code: encoded.first });
};

exports.second = function(req, res, next) {
  if (!req.loggedIn) {
    return next();
  }

  res.render('invite/second.jade', { code: encoded.second });
};