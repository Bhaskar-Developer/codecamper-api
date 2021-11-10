const express = require('express')
const router = express.Router({ mergeParams: true })
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courses')

//Protect Routes that need authentication
const { protectRoute, authorize } = require('../middlewares/auth')

//use advancedResults middleware
const advancedResults = require('../middlewares/advancedResults')

//Include Course model that will be used in advanced results
const Course = require('../models/Course')

router
  .route('/')
  .get(advancedResults(Course, {
    path: 'bootcamp',
    select: 'name description'
  }), getCourses)
  .post(protectRoute, authorize('publisher', 'admin'), createCourse)

router
  .route('/:id')
  .get(getCourse)  
  .put(protectRoute, authorize('publisher', 'admin'), updateCourse)
  .delete(protectRoute, authorize('publisher', 'admin'), deleteCourse)


module.exports = router