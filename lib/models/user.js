var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.SchemaTypes.ObjectId;

var UserSchema = new Schema({
  id: String,
  nickname: String,
  displayName: String,
  name: {
    familyName: String,
    givenName: String
  },
  gender: String,
  url: String,
  birthday: String,
  tagline: String,
  braggingRights: String,
  aboutMe: String,
  image: {
    url: String
  },
  language: String,
  verified: Boolean,
  info: {
    last_ip: String,
    activation_code: String
  },
  agent: {
    codename: String,
    faction: String,
    level: Number
  }
});

mongoose.model('User', UserSchema);
