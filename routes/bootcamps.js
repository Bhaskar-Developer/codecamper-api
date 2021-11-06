const express = require('express')
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsWithinRadius
} = require('../controllers/bootcamps')

//Include other resource routers
const courseRouter = require('./courses')

const router = express.Router()

//Re-Route in to other resource routers
router
  .use('/:bootcampId/courses', courseRouter)

router
  .route('/radius/:zipcode/:distance')
  .get(getBootcampsWithinRadius)

router
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp)

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp)  

module.exports = router