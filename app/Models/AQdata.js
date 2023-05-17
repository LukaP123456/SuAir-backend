const mongoose
    = require('mongoose')

const MeasurementSchema = new mongoose.Schema({
    time: Date,
    test_message: String,
    pollution: {
        ts: Date,
        aqius: Number,
        mainus: String,
    },
    weather: {
        ts: Date,
        tp: Number,
        pr: Number,
        hu: Number,
        ws: Number,
        wd: Number,
        ic: String
    }
}, {timestamps: true, collection: 'iq-air-collection-ts'});

module.exports = mongoose.model('Measurement', MeasurementSchema, 'iq-air-collection-ts')
