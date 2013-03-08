var ABC = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";

exports.generateRandom = function(len) {
  if (typeof len == "undefined") {
    len = 10;
  }
  var code = "";
  while(code.length < len) {
    var rnum = Math.floor(Math.random() * ABC.length);
    code += ABC.substring(rnum, rnum + 1);
  }

  return code;
};