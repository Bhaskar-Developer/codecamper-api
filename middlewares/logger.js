//@desc     Logs the request method and URL to the console
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`)
  next()
}

module.exports = logger

//This is my custom logger. This is not being used. Instead morgan is being used