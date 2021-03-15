const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');
const md5 = require('md5');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    validate: [ validator.isEmail, 'Invalid Email Address!'],
    required: 'You must supply an Email Address!'
  },

  name: {
    type: String,
    trim: true,
    required: 'You must enter a name!'
  },

  bio: {
    type: String,
    default: 'Live to the fullest!'
  },

  photo: {
    type: String,
    default: 'wine_2x.webp'
  },
  
  resetPasswordToken: String,
  
  resetPasswordExpires: String,
  
  bookmarks: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Store' 
    }
  ],
  
  recents: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Store'
    }
  ]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'author', 
  options: { sort: { created: -1 }}
});

//authentication + email is the username 
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);