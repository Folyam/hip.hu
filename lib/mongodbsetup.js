// MongoDB setup
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.SchemaTypes.ObjectId,
    fs = require('fs');

var db_uri = process.env.MONGOHQ_URL || "mongodb://localhost/hiphu";
mongoose.connect(db_uri);

// Load models
var models_path = __dirname + '/models';
fs.readdirSync(models_path).forEach(function (file) {
  return require(models_path+'/'+file);
});

module.exports = mongoose;