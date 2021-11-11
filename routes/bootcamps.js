const express = require('express')
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsWithinRadius,
  uploadPhotoToBootcamp
} = require('../controllers/bootcamps')

//Protect Routes that need authentication
const { protectRoute, authorize } = require('../middlewares/auth')

//use advancedResults middleware
const advancedResults = require('../middlewares/advancedResults')

//include Bootcamp model that will be used in advanced results
const Bootcamp = require('../models/Bootcamp')

//Include other resource routers
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

const router = express.Router()

//Re-Route in to other resource routers
router
  .use('/:bootcampId/courses', courseRouter)
  .use('/:bootcampId/reviews', reviewRouter)

router
  .route('/:id/photo')
  .put(protectRoute, authorize('publisher', 'admin'), uploadPhotoToBootcamp)

router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsWithinRadius)

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protectRoute, authorize('publisher', 'admin'), createBootcamp)

router
  .route('/:id')
  .get(getBootcamp)
  .put(protectRoute, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protectRoute, authorize('publisher', 'admin'), deleteBootcamp)  

module.exports = router