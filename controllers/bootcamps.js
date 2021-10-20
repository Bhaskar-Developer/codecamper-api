//@desc     Get All Bootcamps
//@route    GET /api/v2/bootcamps
//@access   Public
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Show All Bootcamps' })
}

//@desc     Get Bootcamp
//@route    GET /api/v2/bootcamps/:id
//@access   Private
exports.getBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Show Bootcamp ${req.params.id}` })
}

//@desc     Create Bootcamp
//@route    POST /api/v2/bootcamps
//@access   Private
exports.createBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: 'Add a new Bootcamp' })
}

//@desc     Update Bootcamp
//@route    PUT /api/v2/bootcamps/:id
//@access   Private
exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Update Bootcamp ${req.params.id}` })
}

//@desc     Delete Bootcamp
//@route    DELETE /api/v2/bootcamps/:id
//@access   Private
exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: `Delete Bootcamp ${req.params.id}` })
}
