//This is a custom Error response class that will be used by the error middleware to send custom error messages.
class errorResponse extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode=statusCode
  }
}

module.exports = errorResponse