const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MeasurementSchema = new Schema({
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
}, {
    timeseries: {
        timeField: 'time',
        metaField: 'metadata',
        granularity: 'hours',
    },
});

module.exports = mongoose.model('Measurement', MeasurementSchema, 'iq-air-collection-ts')
