const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
    token: String,
    createdAt: {type: Date, expires: '1d', default: Date.now} // Set the TTL index here
}, {collection: 'Invalid-tokens'});

module.exports = mongoose.model('Token', tokenSchema)