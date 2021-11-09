const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middlewares/async')
const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')

//@desc     Get All Courses/Get courses assocaited with a Bootcamp
//@route    GET /api/v2/courses
//@route    GET /api/v2/bootcamps/:bootcampId/courses
//@access   Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    //check if the req params has bootcampId
    //if it does, then get the courses associated with that bootcamp 
    if (req.params.bootcampId) {
        //check if the bootcamp exists
        const bootcamp = await Bootcamp.findById(req.params.bootcampId)

        if (!bootcamp) {
            return next(new errorResponse(`Bootcamp not found with id of ${req.params.bootcampId}`, 404))
        }

        //get the courses that are associated with this bootcamp
        const courses = await Course.find({ bootcamp: req.params.bootcampId })
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
//@access   Private
exports.createCourse = asyncHandler(async (req, res, next) => {
    //get the bootcamp id from the req params and set it as a field in the course that is being created
    req.body.bootcamp = req.params.bootcampId
    //get the user id from the req and set it as a field in the course that is being created
    req.body.user = req.user.id 

    //check if the bootcamp exists
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if (!bootcamp) {
        return next(new errorResponse(`Bootcamp not found with the id of ${req.params.bootcampId}`, 404))
    }

    //If the user is not the owner of the bootcamp then the user cannot add a course
    //Admin can add courses to any bootcamp
    //Publisher can add courses to their own bootcamp only
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new errorResponse(`User with id ${req.user.id} is not authorized to add course to the bootcamp with id ${bootcamp._id}`, 401))
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
//@access   Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    //check if the course to be updated exists in the database
    let course = await Course.findById(req.params.id)

    //if the course does not exist then return a 404 error
    if (!course) {
        return next(new errorResponse(`Course not found with the id of ${req.params.id}`, 404))
    }

    //If the user is not the owner of the course then the user cannot update this course
    //Admin can update any course
    //Publisher can update courses that are owned by them only
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new errorResponse(`User with id ${req.user.id} is not authorized to update course with id ${course._id}`, 401))
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
//@access   Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    //check if the course to be deleted exists in the database
    const course = await Course.findById(req.params.id)

    //if the course does not exist then return a 404 error
    if (!course) {
        return next(new errorResponse(`Course not found with the id of ${req.params.id}`, 404))
    }

    //If the user is not the owner of the course then the user cannot delete this course
    //Admin can delete any course
    //Publisher can delete courses that are owned by them only
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new errorResponse(`User with id ${req.user.id} is not authorized to delete course with id ${course._id}`, 401))
    }

    //Delete the course
    await course.remove()

    res.status(200).json({
        success: true,
        data: {}
    })
})