const Bootcamp = require('../models/Bootcamp')
const errorResponse = require('../utils/errorResponse')

//@desc     Get All Bootcamps
//@route    GET /api/v2/bootcamps
//@access   Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find()
    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    })
  } catch(err) {
    next(err)
  }
}

//@desc     Get Bootcamp
//@route    GET /api/v2/bootcamps/:id
//@access   Private
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id)
    
    //If the bootcamp does not exist then send 404 response
    if(!bootcamp) {
      return next(new errorResponse(`Bootcamp with id ${req.params.id} not found`, 404))
    }

    res.status(200).json({
      success: true,
      data: bootcamp
    })

  } catch(err) {
    next(err)
  }
}

//@desc     Create Bootcamp
//@route    POST /api/v2/bootcamps
//@access   Private
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({
      success: true,
      data: bootcamp
    })
  } catch(err) {
    next(err)
  }
}

//@desc     Update Bootcamp
//@route    PUT /api/v2/bootcamps/:id
//@access   Private
exports.updateBootcamp = async (req, res, next) => {
  try {
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

  } catch(err) {
    next(err)
  }
}

//@desc     Delete Bootcamp
//@route    DELETE /api/v2/bootcamps/:id
//@access   Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

    if(!bootcamp) {
      return next(new errorResponse(`Bootcamp with id ${req.params.id} not found`, 404))
    }

    res.status(200).json({
      status: true,
      data: {}
    })
    
  } catch(err) {
    next(err)
  }
}
