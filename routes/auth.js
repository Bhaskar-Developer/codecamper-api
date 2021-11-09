const express = require('express')
const router = express.Router()
const { registerUser, 
        loginUser, 
        getLoggedInUSer, 
        forgotUserPassword,
        resetUserPassword 
      } = require('../controllers/auth')

//Protect Routes that need authentication
const { protectRoute } = require('../middlewares/auth')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protectRoute, getLoggedInUSer)
router.post('/forgotpassword', forgotUserPassword)
router.put('/resetpassword/:resettoken', resetUserPassword)

module.exports = router