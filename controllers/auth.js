const crypto = require('crypto')
const User = require('../models/User')
const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')
const sendEmail = require('../utils/sendEmail')

//@desc     Register User
//@route    POST /api/v2/auth/register
//@access   Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  //get the user details from the request body
  const { name, email, password, role } = req.body
  
  //Save the user to the Database
  const user = await User.create({
    name,
    email,
    password,
    role
  })

  //send the Token response i.e. token with the cookie
  sendTokenResponse(user, 200, res)
})


//@desc     Login User
//@route    POST /api/v2/auth/login
//@access   Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  //get the email and plain text password from the request body
  const { email, password } = req.body
  
  //check if email and password are not null
  if(!email || !password) {
    return next(new errorResponse('Please provide an email and password', 400))
  }

  //check if the user exists in the Database
  //We select the password manually because it is not selected by default
  const user = await User.findOne({ email }).select('+password')

  //make sure the user is not null
  if(!user) {
    return next(new errorResponse('Invalid credentials', 401))
  }

  //check if the password is correct i.e. the password entered by the user matches the password in the database
  const isMatch = await user.matchPassword(password)

  //if the password is incorrect then send an error
  if(!isMatch) {
    return next(new errorResponse('Invalid credentials', 401))
  }

  //send the Token response i.e. token with the cookie
  sendTokenResponse(user, 200, res)
})

//@desc     Get Current logged in User
//@route    GET /api/v2/auth/me
//@access   Private
exports.getLoggedInUSer = asyncHandler(async (req, res, next) => {
  //get the user id from the request and use it to find the user in the database
  const user = await User.findById(req.user.id)

  //send the user details
  res.status(200).json({
    success: true,
    data: user
  })
})

//@desc     Forgot Password
//@route    POST /api/v1/auth/forgotpassword
//@access   Public
exports.forgotUserPassword = asyncHandler(async (req, res, next) => {
  //check if the user exists in the database with the email provided in the request body
  const user = await User.findOne({ email: req.body.email })

  //if the user does not exist then send a 404 error
  if(!user) {
    return next(new errorResponse('There is no user with this email', 404))
  }

  //generate the reset token
  const resetToken = user.getResetPasswordToken()

  //save the user to the database (Here we add the hashed reset token and the expiry time to the user in database)
  await user.save({ validateBeforeSave: false }) //dont validate the user before saving as it is not required

  //Create a reset url
  //This reset url will be sent to the user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v2/auth/resetpassword/${resetToken}`

  //set the message to notify user that this email was sent as there was a request to reset the password
  const message = `You are receving this email because you(or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetURL}`

  try {
    //send the email
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message
    })

    return res.status(200).json({
      success: true,
      data: 'Email Sent'
    })
  } catch (err) {
    console.log(err)
    //unset the reset token and expiry time fields on the user
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    //save the user to the database after unsetting the above fields
    //run the validations while saving the user
    await user.save({ validateBeforeSave: false })

    //send the error
    return next(new errorResponse('Email could not be sent', 500))
  }

  //This code block is not needed. check and remove later
  res.status(200).json({
    success: true,
    data: user
  })
})

//@desc     Reset User Password
//@route    PUT /api/v1/auth/resetpassword/:resettoken
//@access   Public
exports.resetUserPassword = asyncHandler(async (req, res, next) => {
  //get the token from the request params and then hash it using crypto
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')
  
  //get user from the databse that has this token saved in the resetPasswordToken field
  const user = await User.findOne({ 
    resetPasswordToken,
    //make sure this token is not expired
    //This is done by comparing the resetPasswordExpire with the current time
    // if the current time is greater than the resetPasswordExpire then the token is expired
    resetPasswordExpire: { $gt : Date.now() } 
  })

  //if the user is not found then send an error saying the token is invalid
  if(!user) {
    return next(new errorResponse('Invalid Token', 400))
  }

  //reset the password
  user.password = req.body.password

  //unset the resetPasswordToken and resetPasswordExpire fields on the user
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  //save the updated user back to the database 
  await user.save()

  //send the token response
  sendTokenResponse(user, 200, res) 
})



//Get the Token from model and send the token in cookie to the client
const sendTokenResponse = (user, statusCode, res) => {
  //get the token
  const token = user.getSignedJwtToken()
  
  //set the options for the cookie
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: false
  }

  //set secure to true i.e. use https if the applicaton runs in production
  /*Check if this actually works when application is running in Production mode*/
  if(process.env.NODE_ENV === 'Production') {
    options.secure = true
  }

  //set the cookie and send it
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    })
}