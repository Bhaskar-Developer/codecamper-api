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