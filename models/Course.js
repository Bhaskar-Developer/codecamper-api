const mongoose = require('mongoose')
const colors = require('colors')

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required:[true, 'Please add a course Title']
  },
  description: {
    type: String,
    required: [true, 'Please add description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add tution cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner','intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default:Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
})

// Static method to calculate average cost of bootcamp
CourseSchema.statics.getAverageCost = async function(bootcampId){
  const obj = await this.aggregate([
    //Run Pipeline
    //Match the bootcamp id with the courses bootcamp id then calculate the average cost
    //We want to update average cost field of the bootcamp 
    //We gather all courses that belong to this bootcamp and calcualte the average cost based on the tution field of the courses
    //We then update the new average cost to the bootcamps average cost field
    {
      $match: {bootcamp: bootcampId}
    },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: {$avg: '$tuition'}
      }
    }
  ])

  //Update the bootcamp with the new average cost
  try {
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10
      })
  } catch (err) {
      console.error(err)
  }
}  

//Call static method to update average cost of bootcamp when a new course is created
CourseSchema.post('save', function() {
  const course = this //current instance of course
  course.constructor.getAverageCost(course.bootcamp)
})

//call static method to update average cost of bootcamp when a course is deleted
CourseSchema.post('remove', function() {
  const course = this //current instance of course
  course.constructor.getAverageCost(course.bootcamp)
}) 

module.exports = mongoose.model('Course', CourseSchema)