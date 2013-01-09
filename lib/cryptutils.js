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
  var charCodes=new Array(36);
  charCodes["a"]=". _";
  charCodes["b"]="_ . . .";
  charCodes["c"]="_ . _ .";
  charCodes["d"]="_ . .";
  charCodes["e"]=".";
  charCodes["f"]=". . _ .";
  charCodes["g"]="_ _ .";
  charCodes["h"]=". . . .";
  charCodes["i"]=". .";
  charCodes["j"]=". _ _ _";
  charCodes["k"]="_ . _";
  charCodes["l"]=". _ . .";
  charCodes["m"]="_ _";
  charCodes["n"]="_ .";
  charCodes["o"]="_ _ _";
  charCodes["p"]=". _ _ .";
  charCodes["q"]="_ _ . _";
  charCodes["r"]=". _ .";
  charCodes["s"]=". . .";
  charCodes["t"]="_";
  charCodes["u"]=". . _";
  charCodes["v"]=". . . _";
  charCodes["w"]=". _ _";
  charCodes["x"]="_ . . _";
  charCodes["y"]="_ . _ _";
  charCodes["z"]="_ _ . .";
  charCodes["1"]=". _ _ _ _";
  charCodes["2"]=". . _ _ _";
  charCodes["3"]=". . . _ _";
  charCodes["4"]=". . . . _";
  charCodes["5"]=". . . . .";
  charCodes["6"]="_ . . . .";
  charCodes["7"]="_ _ . . .";
  charCodes["8"]="_ _ _ . .";
  charCodes["9"]="_ _ _ _ .";
  charCodes["0"]="_ _ _ _ _";

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
    var returnArray = new Array();
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