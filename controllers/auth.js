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

  //get the token
  const token = user.getSignedJwtToken()

  //Send the response
  res.status(201).json({ 
    success: true,
    token
  })
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

  //get the token
  const token = user.getSignedJwtToken()

  //Send the response
  res.status(200).json({ 
    success: true,
    token
  })
})