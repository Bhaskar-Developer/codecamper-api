const path = require('path')
const Bootcamp = require('../models/Bootcamp')
const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')
const geocoder = require('../utils/geocoder')

//@desc     Get All Bootcamps
//@route    GET /api/v2/bootcamps
//@access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
})

//@desc     Get Bootcamp
//@route    GET /api/v2/bootcamps/:id
//@access   Private
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    
    //If the bootcamp does not exist then send 404 response
    if(!bootcamp) {
      return next(new errorResponse(`Bootcamp with id ${req.params.id} not found`, 404))
    }

    res.status(200).json({
      success: true,
      data: bootcamp
    })
})

//@desc     Create Bootcamp
//@route    POST /api/v2/bootcamps
//@access   Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    //include the user id in the request body
    req.body.user = req.user.id

    //check for published bootcamp.User with publisher role can only create one bootcamp. User with admin role can create multiple bootcamps
    const publishedBootcamp = await Bootcamp.findOne({user: req.user.id})
    
    //If the user is not an admin i.e. publisher and has already published a bootcamp then return error
    if(publishedBootcamp && req.user.role !== 'admin') {
      return next(new errorResponse(`The user with id ${req.user.id} has already published a bootcamp`, 400))
    }

    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({
      success: true,
      data: bootcamp
    })
})

//@desc     Update Bootcamp
//@route    PUT /api/v2/bootcamps/:id
//@access   Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    if(!bootcamp) {
      return next(new errorResponse(`Bootcamp with id ${req.params.id} not found`, 404))
    }

    res.status(200).json({
      success: true,
      data: bootcamp
    })
})

//@desc     Delete Bootcamp
//@route    DELETE /api/v2/bootcamps/:id
//@access   Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if(!bootcamp) {
      return next(new errorResponse(`Bootcamp with id ${req.params.id} not found`, 404))
    }

    //Remove the bootcamp. 
    //This will also trigger the mongoose middleware that is used to remove the associated courses when a bootcamp is deleted.
    bootcamp.remove()

    res.status(200).json({
      status: true,
      data: {}
    })
})

//@desc     Get Bootcamps within a radius
//@route    GET /api/v2/bootcamps/radius/:zipcode/:distance
//@access   Private
exports.getBootcampsWithinRadius = asyncHandler(async (req, res, next) => {
    //get the zipcode and distance from the request
    const { zipcode, distance } = req.params

    //Get latitude and longitude from geocoder
    const loc = await geocoder.geocode(zipcode)
    const latitude = loc[0].latitude
    const longitude = loc[0].longitude

    //Calculate radius using radians
    //Divide distance by radius of earth
    //Earth Radius = 3,963 mi / 6,378 km
    //Imp: Convert the distance to kilometers later and include Indian addresses.
    const radius = distance / 3963
    const bootcamps = await Bootcamp.find({
      location: { $geoWithin: { $centerSphere: [[longitude, latitude], radius] } }
    })
    
    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    })
})

//@desc     Upload Photo for Bootcamp
//@route    PUT /api/v2/bootcamps/:id/photo
//@access   Private
exports.uploadPhotoToBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if(!bootcamp) {
    return next(new errorResponse(`Bootcamp with id ${req.params.id} not found`, 404))
  }

  //If there is no file then send 400 response
  if(!req.files) {
    return next(new errorResponse(`Please upload a Photo`, 400))
  }

  //Get the file from the request
  const file = req.files.file

  //Make sure the file is an image
  if(!file.mimetype.startsWith('image')) {
    return next(new errorResponse(`Please upload an image file`, 400))
  }

  //Check file size and make sure it is less than 1mb
  if(file.size > process.env.MAX_FILE_SIZE) {
    return next(new errorResponse(`Please upload an image less than ${process.env.MAX_FILE_SIZE}`, 400))
  }

  //Create custom file name
  //Format : photo_bootcamp_id.extension
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
  
  //Save the file in the public directory
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if(err) {
      console.error(err)
      return next(new errorResponse(`Problem with file upload`, 500))
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })

    res.status(200).json({
      success: true,
      data: file.name
    })
  })
})