const express = require('express')
const router = express.Router({ mergeParams: true })
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courses')

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
  .post(createCourse)

router
  .route('/:id')
  .get(getCourse)  
  .put(updateCourse)
  .delete(deleteCourse)


module.exports = router