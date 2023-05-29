const {StatusCodes} = require('http-status-codes')
/*
* In this file all possible errors are handled ie if the server spits out a hideous error with a random status code that
* error will be remodeled in here to look prettier and give a less detailed error message
* */

const errorHandlerMiddleware = (err, req, res, next) => {
    console.log('Entered error-handler')
    console.log(err)
    let customError = {
        // set default
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || 'Something went wrong try again later'
    }
    if (err.name === 'ValidationError') {
        console.log('Validation error')
        customError.msg = Object.values(err.errors).map((item) => item.message).join(',')
        customError.statusCode = 400
    }
    if (err.code && err.code === 11000) {
        console.log('Duplicate data in database')
        customError.msg = `Duplicate value entered for ${Object.keys(err.keyValue)} field please choose another value`
        customError.statusCode = 400
    }
    if (err.name === 'CastError') {
        console.log('No item found')
        customError.msg = `No item found with id: ${err.value}`
        customError.statusCode = 400
    }
    if (err.name === 'TypeError' && req.user === undefined) {
        console.log(err)
        customError.msg = `Token required`
        customError.statusCode = 403
    }
    console.log('End of if else statements')
    return res.status(customError.statusCode).json({msg: customError.msg})
}

module.exports = errorHandlerMiddleware
