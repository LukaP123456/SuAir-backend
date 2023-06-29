const mongoose = require('mongoose');

const UserDataSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    range: [Number],
    country: String,
    login_time: Date,
    device_type: String,
    user_agent: String,
    ip_address: String,
    language: String,
    region: String,
    is_in_eu: String,
    timezone: String,
    city: String,
    latitude_longitude: [Number],
    metro_area_code: Number,
    radius_around_lat_lon: Number
}, {collection: 'user-data'});

module.exports = mongoose.model('UserData', UserDataSchema)
