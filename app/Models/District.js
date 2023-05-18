const mongoose = require('mongoose');


const districtSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    }
}, {collection: 'SU-districts'});

module.exports = mongoose.model('District', districtSchema)
