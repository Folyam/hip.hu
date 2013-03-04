var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.SchemaTypes.ObjectId;

var LevelSchema = new Schema({
  codename: String,
  level: Number,
  timestamp: Date,
  faction: String
});

mongoose.model('Level', LevelSchema);
