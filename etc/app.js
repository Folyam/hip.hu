var fs = require('fs');

module.exports.version = JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version;
module.exports.Page = {
  long: "Hungarian Ingress Players",
  short: "hip"
};