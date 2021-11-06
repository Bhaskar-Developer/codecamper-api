const path = require('path')
const Bootcamp = require('../models/Bootcamp')
const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')
const geocoder = require('../utils/geocoder')

//@desc     Get All Bootcamps
//@route    GET /api/v2/bootcamps
//@access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let query

    //Copy req.query
    const reqQuery = { ...req.query }

    //Fields to exclude
    const removeFields = ['select','sort', 'page', 'limit']

    //Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param])

    //convert the query string to json strings
    let queryStr = JSON.stringify(reqQuery)
  
    //Filter out bootcamps based on the average cost(a field defined in the Bootcamp model)). 
    //lt=less-than,lte=less-than-equal-to,gt=greater-than,gte=greater-than-equal-to
    //replace gte,gt,lte,lt,in with $gte,$gt,$lte,$lt,$in. 
    //These can be used directly used as a mongoose operator 
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, match => `$${match}`)
    
    //parse the query string to json
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses')

    //Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }

    //Sort the data by specified fields. If there is no sort query then sort by descending order of createdAt
    if(req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ')
      query = query.sort(sortBy)
    } else {
      query = query.sort('-createdAt')
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 25
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await Bootcamp.countDocuments()

    query = query.skip(startIndex).limit(limit)

    const bootcamps = await query

    //Pagination result
    const pagination = {}

    //If endIndex is less than total then there are more pages ahead
    //Show next page deails if you are not on the last page
    if(endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      }
    }

    //If startIndex is more than 0 then there are pages behind
    //Show previous page details if you are not on the first page
    if(startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      }
    }

    res.status(200).json({
      success: true,
      count: bootcamps.length,
      pagination,
      data: bootcamps
    })
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