const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required:[true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true,'Please add an email'],
    match:[
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid Email'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false //The password wont be returned in the response
  },
  resetPasswordToken:String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default:Date.now
  }
})

//hash the password before saving it to the database
UserSchema.pre('save', async function(next){
  const user = this //this is the current user that is about to be saved
  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(user.password, salt)
  next()
})

//create a signed JWT and return it when a user is registered
UserSchema.methods.getSignedJwtToken = function() {
  const user = this //this is the current instance of the user
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

module.exports = mongoose.model('User', UserSchema)