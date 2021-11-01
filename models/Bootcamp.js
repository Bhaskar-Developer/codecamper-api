const mongoose = require('mongoose')
const slugify = require('slugify')

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
  }
})

//Run this mongoose middleware to convert the Bootcamp name into a slug and then save it to the Slug field in the Bootcamp
BootcampSchema.pre('save', function(next) {
  const bootcamp = this //This is current instance of the bootcamp that is about to be saved.
  bootcamp.slug = slugify(bootcamp.name, { lower:true })
  next()
})

module.exports = mongoose.model('Bootcamp',BootcampSchema)
