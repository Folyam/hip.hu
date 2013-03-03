exports.caesar = function(input, key) {
  var output = "";
    for (var i = 0; i < input.length; i++) {
    var c = input.charCodeAt(i);
    if      (c >= 65 && c <=  90) output += String.fromCharCode((c - 65 + key) % 26 + 65);  // Uppercase
    else if (c >= 97 && c <= 122) output += String.fromCharCode((c - 97 + key) % 26 + 97);  // Lowercase
    else                          output += input.charAt(i);  // Copy
  }
  return output;
};

exports.toMorseCode = (function() {
  var charCodes = {
    "a": ". _",
    "b": "_ . . .",
    "c": "_ . _ .",
    "d": "_ . .",
    "e": ".",
    "f": ". . _ .",
    "g": "_ _ .",
    "h": ". . . .",
    "i": ". .",
    "j": ". _ _ _",
    "k": "_ . _",
    "l": ". _ . .",
    "m": "_ _",
    "n": "_ .",
    "o": "_ _ _",
    "p": ". _ _ .",
    "q": "_ _ . _",
    "r": ". _ .",
    "s": ". . .",
    "t": "_",
    "u": ". . _",
    "v": ". . . _",
    "w": ". _ _",
    "x": "_ . . _",
    "y": "_ . _ _",
    "z": "_ _ . .",
    "1": ". _ _ _ _",
    "2": ". . _ _ _",
    "3": ". . . _ _",
    "4": ". . . . _",
    "5": ". . . . .",
    "6": "_ . . . .",
    "7": "_ _ . . .",
    "8": "_ _ _ . .",
    "9": "_ _ _ _ .",
    "0": "_ _ _ _ _"
  };

  return function(text) {
    var chars = text.toLowerCase().split("");
    var temp = "";

    for (a=0; a<chars.length; a++) {
      if (chars[a]!=" ") {
        if (charCodes[chars[a]]) {
          temp+=charCodes[chars[a]]+"  ";
          // temp+=chars[a]+"="+charCodes[chars[a]]+"\n";
        } else {
        // temp+=chars[a]+"=(None)\n";
        }
      } else {
        temp+=" // ";
      }
    }

    return temp;
  };
})();

exports.stringToBinary = (function() {
  function dec2bin(d) {
    var b = '';
    for (var i = 0; i < 8; i++) {
      b = (d%2) + b;
      d = Math.floor(d/2);
    }
    return b;
  }

  return function(text) {
    var returnArray = [];
    for (var i = 0, _l = text.length; i < _l; i++) {
      var character = text.charCodeAt(i);
      if (character < 128) {
        returnArray[i] = dec2bin(character);
      } else {
        returnArray[i] = 'XXXXXXXX';
      }
    }

    return returnArray;
  };
})();