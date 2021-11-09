const User = require('../models/User')
const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')

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

  //if the password is incorrect then show an error
  if(!isMatch) {
    return next(new errorResponse('Invalid credentials', 401))
  }

  //send the Token response i.e. token with the cookie
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
