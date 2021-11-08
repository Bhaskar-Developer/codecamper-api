const advancedResults = (model, populate) => async (req, res, next) => {
    let query

    //Copy req.query
    const reqQuery = { ...req.query }

    //Fields to exclude
    const removeFields = ['select','sort', 'page', 'limit']

    //Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param])

    //convert the query string to json strings
    let queryStr = JSON.stringify(reqQuery)
  
    //lt=less-than,lte=less-than-equal-to,gt=greater-than,gte=greater-than-equal-to
    //replace gte,gt,lte,lt,in with $gte,$gt,$lte,$lt,$in. 
    //These can be used directly used as a mongoose operator 
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, match => `$${match}`)
    
    //parse the query string to json
    query = model.find(JSON.parse(queryStr))

    //If query has select option then select the specified fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }

    //If the query has sort option then sort the data by specified fields. 
    if(req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ')
      query = query.sort(sortBy)
      //Sort by descending order of course title is not working. Check the query string
    } else {
      //If no sort criteria is specified then sort data by ascending order of createdAt
      query = query.sort('createdAt')
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 25
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await model.countDocuments()

    query = query.skip(startIndex).limit(limit)

    //Populate the data as per the populate value
    if(populate) {
      query = query.populate(populate)
    }

    const results = await query

    //Pagination result
    const pagination = {}

    //If endIndex is less than total then there are more pages ahead
    //Show next page deails if you are not on the last page
    if(endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      }
    }

    //If startIndex is more than 0 then there are pages behind
    //Show previous page details if you are not on the first page
    if(startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      }
    }

    //send the advanced results in response
    res.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: results
    }

    next()
}

module.exports = advancedResults