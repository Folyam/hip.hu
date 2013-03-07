var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.SchemaTypes.ObjectId;

var StatLevelSchema = new Schema({
  _id: String,
  value: {
    sum: Number,
    factions: {
      Resistance: Number,
      Enlightened: Number
    }
  }
});

mongoose.model('StatLevel', StatLevelSchema, "stat_levels");
