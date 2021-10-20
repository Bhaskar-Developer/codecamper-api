const Bootcamp = require('../models/Bootcamp')

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
    res.status(400).json({
      success: false
    })
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
      return res.status(404).json({
        success: false
      })
    }

    res.status(200).json({
      success: true,
      data: bootcamp
    })

  } catch(err) {
    //This will be sent if the bootcamp id does not have a proper format i.e. type is not Object Id
    res.status(500).json({
      success: false
    })
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
    res.status(400).json({
      success:false
    })
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
      return res.status(400).json({
        success:false
      })
    }

    res.status(200).json({
      success: true,
      data: bootcamp
    })

  } catch(err) {
    return res.status(400).json({
      success:false
    })
  }
}

//@desc     Delete Bootcamp
//@route    DELETE /api/v2/bootcamps/:id
//@access   Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

    if(!bootcamp) {
      return res.status(400).json({
        success: false
      })
    }

    res.status(200).json({
      status: true,
      data: {}
    })
    
  } catch(err) {
    return res.status(400).json({
      success: false
    })
  }
}
