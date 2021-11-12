const express = require('express')
const router = express.Router()
const { registerUser, 
        loginUser, 
        LogOutUser,
        LogoutUserFromEverywhere,
        getLoggedInUser, 
        forgotUserPassword,
        resetUserPassword,
        updateUserDetails,
        updateUserPassword 
      } = require('../controllers/auth')

//Protect Routes that need authentication
const { protectRoute } = require('../middlewares/auth')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/logout', protectRoute, LogOutUser)
router.get('/logoutall', protectRoute, LogoutUserFromEverywhere)
router.get('/me', protectRoute, getLoggedInUser)
router.put('/updatedetails', protectRoute, updateUserDetails)
router.put('/updatepassword', protectRoute, updateUserPassword)
router.post('/forgotpassword', forgotUserPassword)
router.put('/resetpassword/:resettoken', resetUserPassword)

module.exports = router