const express = require('express')
const router = express.Router({ mergeParams: true })
const {
  getReviews,
  getReview
} = require('../controllers/reviews')

//Protect Routes that need authentication
const { protectRoute, authorize } = require('../middlewares/auth')

//use advancedResults middleware
const advancedResults = require('../middlewares/advancedResults')

//Include Course model that will be used in advanced results
const Review = require('../models/Review')

router
  .route('/')
  .get(advancedResults(Review, {
    path: 'bootcamp',
    select: 'name description'
  }), getReviews)

router
  .route('/:id')
  .get(getReview)  

module.exports = router