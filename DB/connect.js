const mongoose = require('mongoose')

const connectDB = (url) => {
    return mongoose.connect(url, {
        dbName: 'iq-air-database',
    })
}

module.exports = connectDB
