const User = require('../models/User')
const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')

//@desc     Register User
//@route    GET /api/v2/auth/register
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