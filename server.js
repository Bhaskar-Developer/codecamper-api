const express = require('express')
const dotenv = require('dotenv')
//const logger = require('./middlewares/logger')
const morgan = require('morgan')

//Load Route Files
const bootcamps = require('./routes/bootcamps')

// Load Environment Variables
dotenv.config({ path: './config/config.env' })

const app = express()

//Use morgan to log the request along with the route
//This will run only when the server is running in Development mode
if(process.env.NODE_ENV === 'Development') {
  app.use(morgan('dev'))
}

//Mount Routes
app.use('/api/v2/bootcamps', bootcamps)

const PORT = process.env.PORT || 5000

app.listen(
  PORT, 
  console.log(`Server running in ${process.env.NODE_ENV} mode on Port ${PORT}`)
)