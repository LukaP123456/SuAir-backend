const mongoose = require('mongoose');

const UserDataSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    range: [Number],
    country: String,
    user_agent: String,
    ip_address: String,
    language: String,
    region: String,
    is_in_eu: String,
    timezone: String,
    city: String,
    latitude_longitude: [Number],
    metro: Number,
    area: Number
}, {collection: 'user-data'});

module.exports = mongoose.model('UserData', UserDataSchema)
