module.exports.getToday = function() {
  var currentTime = new Date();
  var y = currentTime.getFullYear();
  var m = currentTime.getMonth() + 1;
  if (m < 10) {
    m = "0" + m;
  }
  var d = currentTime.getDate();
  return new Date("" + y + "-" + m  + "-" + d);
};