const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')
const Review = require('../models/Review')
const Bootcamp = require('../models/Bootcamp')

//@desc     Get All Reviews / Get Reviews assocaited with a Bootcamp
//@route    GET /api/v2/reviews
//@route    GET /api/v2/bootcamps/:bootcampId/reviews
//@access   Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  //check if the req params has bootcampId
  if (req.params.bootcampId) {
      //get the bootcamp from the database
      const bootcamp = await Bootcamp.findById(req.params.bootcampId)

      //if the bootcamp is not found then return a 404 error
      if (!bootcamp) {
          return next(new errorResponse(`Bootcamp not found with id of ${req.params.bootcampId}`, 404))
      }

      //get the reviews that are associated with this bootcamp
      const reviews = await Review.find({ bootcamp: req.params.bootcampId })
      //send all the matched reviews if there is not filter used
      return res.status(200).json({
          success: true,
          count: reviews.length,
          data: reviews
      })
  } else {
     //send the advanced results
     res.status(200).send(res.advancedResults)
  }
})

//@desc     Get a single Review
//@route    GET /api/v2/reviews/:id
//@access   Public
exports.getReview = asyncHandler(async (req, res, next) => {
  //get the review from the database having the id specified in the req params
  //Also populate the bootcamp field with the bootcamp name and description
  const review = await Review.findById(req.params.id).populate({
      path: 'bootcamp',
      select: 'name description'
  })

  //if the review is not found then return a 404 error
  if (!review) {
      return next(new errorResponse(`Review not found with id of ${req.params.id}`, 404))
  }

  //send the review if it is found
  res.status(200).json({
      success: true,
      data: review
  })
})


//@desc     Add a new Review
//@route    POST /api/v2/bootcamps/:bootcampId/reviews
//@access   Private
exports.addReview = asyncHandler(async (req, res, next) => {
  //add the bootcamp id to the req body
  req.body.bootcamp = req.params.bootcampId
  //add the user id to the req body
  req.body.user = req.user.id

  //check if the bootcamp exists
  const bootcamp = await Bootcamp.findById(req.params.bootcampId)

  //if the bootcamp is not found then return a 404 error
  if (!bootcamp) {
      return next(new errorResponse(`Bootcamp not found with id of ${req.params.bootcampId}`, 404))
  }

  //create the review and save it to the database
  const review = await Review.create(req.body)
  
  //send the review if it is found
  res.status(201).json({
      success: true,
      data: review
  })
})

//@desc     Update Review
//@route    PUT /api/v2/reviews/:id
//@access   Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  //get the review form the database
  let review = await Review.findById(req.params.id)

  //if the review is not found then return a 404 error
  if (!review) {
      return next(new errorResponse(`Review not found with id of ${req.params.id}`, 404))
  }

  //check if the user is the owner of this review or is an admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new errorResponse(`User with id ${req.params.id} is not authorized to update this review`, 401))
  }

  //update the review and save it to the database
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
  })

  //send the response
  res.status(200).json({
      success: true,
      data: review
  })
})

//@desc     Delete Review
//@route    DELETE /api/v2/reviews/:id
//@access   Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  //get the review form the database
  const review = await Review.findById(req.params.id)

  //if the review is not found then return a 404 error
  if (!review) {
      return next(new errorResponse(`Review not found with id of ${req.params.id}`, 404))
  }

  //check if the user is the owner of this review or is an admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new errorResponse(`User with id ${req.params.id} is not authorized to delete this review`, 401))
  }

  //delete the review from the database
  //The remove method triggers the middleware to calculate the average rating after the review is deleted
  await review.remove()

  //send the response
  res.status(200).json({
      success: true,
      data: {}
  })
})