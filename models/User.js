const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

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
  tokens:[{
    token: {
      type: String,
      required: true
    }
  }],
  resetPasswordToken:String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default:Date.now
  }
})

//Dont send the token in the response when user logs in or when current logged in user details are returned
UserSchema.methods.toJSON = function() {
  const user = this
  const userObject = user.toObject()
  
  //delete the password, tokens array and avatar as we don't want to send them
  delete userObject.tokens

  return userObject
}

//hash the password before saving it to the database
UserSchema.pre('save', async function(next){
  const user = this //this is the current user that is about to be saved

  //Check if the password has been modified
  //If not, skip the hashing process and go to the next middleware
  if(!user.isModified('password')) {
    return next()
  }

  //Hash the password. 
  //This will run only if password is modified
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

//match user entered password(during login) to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  const user = this //this is the current instance of the user
  return await bcrypt.compare(enteredPassword, user.password)
}

//Send reset password token and hash the token and save in the database with the expires time
UserSchema.methods.getResetPasswordToken = function() {
  const user = this //this is the current instance of the user
  //Generate a reset token with crypto. Convert it to a string and send it in the response
  const resetToken = crypto.randomBytes(20).toString('hex')

  //Hash the token and save it in the database along with the expire time
  //The expire time is set to 10 minutes
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000

  return resetToken
}

module.exports = mongoose.model('User', UserSchema)