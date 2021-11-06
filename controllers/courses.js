const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')
const Course = require('../models/Course')

//@desc     Get All Courses/Get courses assocaited with a Bootcamp
//@route    GET /api/v2/courses
//@route    GET /api/v2/bootcamps/:bootcampId/courses
//@access   Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query

    //check if the req params has bootcampId and build the query based on that
    if (req.params.bootcampId) {
        //get the courses that are associated with the specified bootcamp id
        query = Course.find({ bootcamp: req.params.bootcampId })
    } else {
       //get all courses if the req params does not have bootcampId
        query = Course.find().populate({
          path: 'bootcamp',
          select: 'name description'
        })
    }

    const courses = await query

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    })
})