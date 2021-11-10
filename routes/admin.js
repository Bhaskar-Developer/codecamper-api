const express = require('express')
const router = express.Router({ mergeParams: true })
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/admin')

//Protect Routes that need authentication
const { protectRoute, authorize } = require('../middlewares/auth')
//use advancedResults middleware
const advancedResults = require('../middlewares/advancedResults')

//Include USer model that will be used in advanced results
const User = require('../models/User')

//Use the protectRoute and authorize middlewares as these will be needed in all the routes
router.use(protectRoute)
router.use(authorize('admin'))

router
  .route('/')
  .get(advancedResults(User), getAllUsers)
  .post(createUser)

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser)  

module.exports = router