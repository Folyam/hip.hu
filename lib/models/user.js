var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.SchemaTypes.ObjectId;

var UserSchema = new Schema({
  id: String,
  email: String,
  name: String,
  given_name: String,
  family_name: String,
  link: String,
  picture: String,
  gender: String,
  birthday: String,
  locale: String,
  agent: {
    codename: String,
    faction: String,
    level: Number,
    city: String
  },
  info: {
    last_ip: String,
    activation_code: String
  }
});
//User =
mongoose.model('User', UserSchema);
