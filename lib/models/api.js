var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.SchemaTypes.ObjectId;

var ApiSchema = new Schema({
  codename: { type: String, "default": "", unique: true },
  gplusid: { type: String, 'default': "", unique: true },
  created_at: { type: Date, "default": new Date() },
  key: { type: String, "default": "", unique: true },
  query_count: { type: Number, "default": 0 },
  last_query: { type: Date, "default": new Date() }
});

mongoose.model('Api', ApiSchema);
