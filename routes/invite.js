var CryptUtils = require('../lib/cryptutils');
//var Png = require('png').Png;

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
      if (i > 0 && (i+1) % 13 === 0) {
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
    return "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";
    var code = "Invite Code: RRYHC2CT";
    var encoded = code.replace(/./g, '_');

    encoded = (new Buffer(code)).toString('base64');
    encoded = CryptUtils.caesar(encoded, 12) + 'Lyctofcaff+CaesarSqrt144==';

    var width = 256, height = 256;

    var base = new Buffer(encoded);
    var buffer = new Buffer(width*height*3);

    var i, j;

    for(i = 0, _l = buffer.length; i < _l; i++) {
      buffer[i] = 0;
    }

    for(i = 0, _l = base.length; i < _l; i++) {
      buffer[i] = base[i];
    }

    var position = 0;
    var line = buffer.length/width;

    //position = calculatePixel(width, height, 2, height/2);    fillPixel(buffer, position, [255, 255, 255]);
    //position = calculatePixel(width, height, 3, height/2);    fillPixel(buffer, position, [255, 255, 255]);
    //position = calculatePixel(width, height, 4, height/2);    fillPixel(buffer, position, [255, 255, 255]);

    for(i = 0; i < height/3-3; i++) {
      for(j = -1; j < 2; j++) {
        position = calculatePixel(width, height, i+2, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+3, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+4, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+2, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+3, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+4, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
      }
    }

    for(i = height; i > height/3*2+3; i--) {
      for(j = -1; j < 2; j++) {
        position = calculatePixel(width, height, i+2, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+3, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+4, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+2, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+3, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+4, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
      }
    }

    for(i = height/3-3; i < height/3*2+3; i++) {
      for(j = width/6-3; j < width/6; j++) {
        position = calculatePixel(width, height, i+2, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+4, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+6, height/2+i+j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+2, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+4, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
        position = calculatePixel(width, height, i+6, height/2-i-j);  fillPixel(buffer, position, [255, 255, 255]);
      }
    }

    for(i = height/3-3; i < height/3*2+3; i++) {
      for(j = width/2-3; j < width/2; j++) {
        position = calculatePixel(width, height, i-2, height/2+i+j);  fillPixel(buffer, position, [(255-i*j)%255, 0, 0]);
        position = calculatePixel(width, height, i-4, height/2+i+j);  fillPixel(buffer, position, [100, (255-i*j)%255, 100]);
        position = calculatePixel(width, height, i-6, height/2+i+j);  fillPixel(buffer, position, [134, 122, (255-i*j)%255]);
        position = calculatePixel(width, height, i-2, height/2-i-j);  fillPixel(buffer, position, [(255-i*j)%255, 100, 124]);
        position = calculatePixel(width, height, i-4, height/2-i-j);  fillPixel(buffer, position, [(255-i+2*j)%255, 223, (255-i*j)%255]);
        position = calculatePixel(width, height, i-6, height/2-i-j);  fillPixel(buffer, position, [98, (255-i*j)%255, 144]);
      }
    }

    for(i = height/3-3; i < height/3*2+3; i++) {
      for(j = width/2-3; j < width/2; j++) {
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

exports.third = function(req, res, next) {
  if (!req.loggedIn) {
    return next();
  }

  res.render('invite/third.jade');
};
