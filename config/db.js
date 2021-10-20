const mongoose = require('mongoose')

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  //Log the Connection Host to the Console
  console.log(`MongoDB Connected: ${conn.connection.host}`)
}

module.exports = connectDB