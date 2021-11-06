const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')
const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')

//@desc     Get All Courses/Get courses assocaited with a Bootcamp
//@route    GET /api/v2/courses
//@route    GET /api/v2/bootcamps/:bootcampId/courses
//@access   Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    //check if the req params has bootcampId and build the query based on that
    if (req.params.bootcampId) {
        //get the courses that are associated with the specified bootcamp id
        const courses = Course.find({ bootcamp: req.params.bootcampId })
        //send all the matched courses if there is not filter used
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
       res.status(200).send(res.advancedResults)
    }
})

//@desc     Get Single Course
//@route    GET /api/v2/courses/:id
//@access   Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    //Fetch course specified by the id and populate the bootcamp field
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })

    if (!course) {
        return next(new errorResponse(`Course not found with the id of ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        data: course
    })
})


//@desc     Add New Course
//@route    POST /api/v2/bootcamps/:bootcampId/courses
//@access   Public
exports.createCourse = asyncHandler(async (req, res, next) => {
    //get the bootcamp id from the req params and set it as a field in the course that is being created
    req.body.bootcamp = req.params.bootcampId 

    //check if the bootcamp exists
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if (!bootcamp) {
        return next(new errorResponse(`Bootcamp not found with the id of ${req.params.bootcampId}`, 404))
    }

    //create the course if the bootcamp exists
    const course = await Course.create(req.body)

    res.status(200).json({
        success: true,
        data: course
    })
})


//@desc     Update Course
//@route    PUT /api/v2/courses/:id
//@access   Public
exports.updateCourse = asyncHandler(async (req, res, next) => {
    //check if the course to be updated exists in the database
    let course = await Course.findById(req.params.id)

    if (!course) {
        return next(new errorResponse(`Course not found with the id of ${req.params.id}`, 404))
    }

    //Update the course
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: course
    })
})

//@desc     Delete Course
//@route    PUT /api/v2/courses/:id
//@access   Public
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    //check if the course to be deleted exists in the database
    const course = await Course.findById(req.params.id)

    if (!course) {
        return next(new errorResponse(`Course not found with the id of ${req.params.id}`, 404))
    }

    //Delete the course
    await course.remove()

    res.status(200).json({
        success: true,
        data: {}
    })
})