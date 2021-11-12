const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required:[true, 'Please add a title for the review'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add some text']
  },
  rating: {
    type: Number,
    min:1,
    max:10,
    required: [true, 'Please add a rating between 1 and 10']
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

//User can add only one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1}, {unique: true})

//static method to get the average rating for a bootcamp
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
  //Run Pipeline
    //Match the bootcamp id with the review's bootcamp id then calculate the average rating
    //We want to update average rating field of the bootcamp 
    //We gather all ratings that belong to this bootcamp and calcualte the average rating based on the rating field of the ratings
    //We then update the new average rating to the bootcamp's averageRating field
  const obj = await this.aggregate([
    {
      $match: {bootcamp: bootcampId}
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: {$avg: '$rating'}
      }
    }
  ])
  
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      //adding the calculated average rating to the Database
      averageRating: obj[0].averageRating
    })
  } catch (err) {
    console.error(err)
  }
}

//Call getAverageRating after save
ReviewSchema.post('save', function() {
  const review = this
  review.constructor.getAverageRating(review.bootcamp)
})

//Call getAverageRating before remove
ReviewSchema.post('remove', function() {
  const review = this
  review.constructor.getAverageRating(review.bootcamp)
})

module.exports = mongoose.model('Review', ReviewSchema)