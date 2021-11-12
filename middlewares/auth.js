const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const errorResponse = require('../utils/errorResponse')
const User = require('../models/User')

//Protect routes that require authentication
exports.protectRoute = asyncHandler(async (req, res, next) => {
  let token

  //check if the token is set in the Authorization header. Also check if this Authorization header starts with the word Bearer
  //If this starts with Bearer, then we know that the token is set in the Authorization header. We can then get the token from this header
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //split the Bearer from the token and extract the token
    token = req.headers.authorization.split(' ')[1]
  }

  //set token from cookie if it exists in the request
  // else if(req.cookie.token) {
  //   token = req.cookies.token
  //   console.log(token)
  // }

  //if token is null then return an error
  if(!token) {
    return next(new errorResponse('Not authorized to access this route', 401))
  }

  //Verify the token
  try {
    //decode the token and get the userId
    const decodedData = jwt.verify(token, process.env.JWT_SECRET)
    //console.log(decodedData)
    //check if there is a user with the decoded userId in the database
    //If the user exists then set this as the req.user
    //console.log(decodedData.id)
    req.user = await User.findById(decodedData.id)
    req.token = token
    next()
  } catch (error) {
    return next(new errorResponse('Not authorized to access this route', 401))
  }
})

//Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)) {
      return next(new errorResponse(`User with role ${req.user.role} is not authorized to access this route`, 403))
    }
    next()
  }
}