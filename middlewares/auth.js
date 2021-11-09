const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const errorResponse = require('../utils/errorResponse')
const User = require('../models/User')

exports.protectRoute = asyncHandler(async (req, res, next) => {
  let token

  //check if the Authorization header is set and if this Authorization header starts with the word Bearer
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //split the Bearer from the token and extract the token
    token = req.headers.authorization.split(' ')[1]
  }

  //Not using right now!
  //set token from cookie if it exists in the request
  // else if(req.cookies.token) {
  //   token = req.cookies.token
  //  }

  //if token is null then return an error
  if(!token) {
    return next(new errorResponse('Not authorized to access this route', 401))
  }

  //Verify the token
  try {
    //decode the token and get the userId
    const decodedData = jwt.verify(token, process.env.JWT_SECRET)
    console.log(decodedData)
    //check if there is a user with the decoded userId in the database
    //If the user exists then set this as the req.user
    req.user = await User.findById(decodedData.id)
    next()
  } catch (error) {
    return next(new errorResponse('Not authorized to access this route', 401))
  }
})