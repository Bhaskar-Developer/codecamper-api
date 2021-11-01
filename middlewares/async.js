//Async handler for exceptions in the controllers.
//This method prevents the repeated usage of try-catch in the controllers.
//This helps the Developer to follow the DRY(Don't Repeat Yourself) rule!
const asyncHandler = fn => (req, res, next) =>
  Promise
    .resolve(fn(req, res, next))
    .catch(next)

module.exports = asyncHandler    