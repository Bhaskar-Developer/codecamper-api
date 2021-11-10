const User = require('../models/User')
const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')

//@desc     Get All Users
//@route    GET /api/v2/auth/users
//@access   Private
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  //send the advanced results
  res.status(200).json(res.advancedResults)
})

//@desc     Get Single User
//@route    GET /api/v2/auth/users/:id
//@access   Private
exports.getUser = asyncHandler(async (req, res, next) => {
  //get the user from the database using the id
  const user = await User.findById(req.params.id)

  //send error if user is not found
  if (!user) {
    return next(new errorResponse(`User not found with id of ${req.params.id}`, 404))
  }

  //send the user details
  res.status(200).json({
    success: true,
    data: user
  })
})

//@desc     Create User
//@route    POST /api/v2/auth/users
//@access   Private
exports.createUser = asyncHandler(async (req, res, next) => {
  //get the user details from the body
  const user = await User.create(req.body)

  //send the user details
  res.status(201).json({
    success: true,
    data: user
  })
})

//@desc     Update User
//@route    POST /api/v2/auth/users/:id
//@access   Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  //get the user from the database using the idand then update the user with the details from the body
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  //send the user details
  res.status(200).json({
    success: true,
    data: user
  })
})

//@desc     Delete User
//@route    DELETE /api/v2/auth/users/:id
//@access   Private
exports.deleteUser = asyncHandler(async (req, res, next) => {
  //find the user in the database using the id and then delete the user
  await User.findByIdAndDelete(req.params.id)

  //send the response
  res.status(200).json({
    success: true,
    data: {}
  })
})