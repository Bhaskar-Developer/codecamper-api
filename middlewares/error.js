const errorResponse = require('../utils/errorResponse')

const errorHandler = (err, req, res, next) => {
  //assign all properties on err to the error object
  let error = { ...err }
  error.message = err.message

  console.log(err.stack.red.bold)
  
  //Mongoose Bad ObjectId error
  if(err.name === 'CastError') {
    const message = `Resource not found with id ${err.value}`
    error = new errorResponse(message, 404)
  }
  
  res.status(error.statusCode || 500).send({
    success: false,
    error: error.message || 'Server Error'
  })
}

module.exports = errorHandler