const mongoose = require('mongoose')
const slugify = require('slugify')
const geocoder = require('../utils/geocoder')
const Course = require('./Course')

//Create the Schema for Bootcamps
const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true,'Please add a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 Characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true,'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 Characters']
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please enter valid URL with HTTP or HTTPS' 
    ]
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number cannot be more than 20 Characters']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add valid Email' 
    ]
  },
  address: {
    type: String,
    required: [true,'Please add an address']
  },
  location: {
    //GeoJSON Point
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'] // 'location.type' must be 'Point'
      //required: true
      //This is giving issue, location.type is required!!
    },
    coordinates: {
      type: [Number],
      index:'2dsphere'
      //required: true
      //This is giving error, location.coordinates is required
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  careers: {
    type: [String],
    required: true,
    enum: [
      'Web Development',
      'Mobile Development',
      'UI/UX',
      'Data Science',
      'Business',
      'Other'
    ]
  },
  averageRating: {
    type: Number,
    min: [1,'Rating must be atleast 1'],
    max: [10,'Rating cannot be more than 10']
  },
  averageCost: Number,
  photo: {
    type: String,
    default: 'no-photo.jpg'
  },
  housing: {
    type: Boolean,
    default: false
  },
  jobAssistance: {
    type: Boolean,
    default: false
  },
  jobGuarantee: {
    type: Boolean,
    default: false
  },
  acceptGi: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default:Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
},{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

//Run this mongoose middleware to convert the Bootcamp name into a slug and then save it to the Slug field in the Bootcamp
BootcampSchema.pre('save', function(next) {
  const bootcamp = this //This is current instance of the bootcamp that is about to be saved.
  bootcamp.slug = slugify(bootcamp.name, { lower:true })
  next()
})

//Run this mongoose middleware to convert the bootcamp address field to an object and fill the details in the location field of bootcamp
BootcampSchema.pre('save', async function(next) {
  const bootcamp = this //This is current instance of the bootcamp that is about to be saved.
  const loc = await geocoder.geocode(bootcamp.address)
  //Populate Location entry in Bootcamp
  bootcamp.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  }

  //Do not save address in DataBase
  bootcamp.address = undefined
  next()
}) 

//Create a virtual field on Bootcamp for courses
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false
})

//Cascade Delete associated courses when a bootcamp is deleted
BootcampSchema.pre('remove', async function(next) {
  const bootcamp = this //This is current instance of the bootcamp that is about to be deleted.
  await Course.deleteMany({ bootcamp: bootcamp._id })
  next()
})

module.exports = mongoose.model('Bootcamp',BootcampSchema)
