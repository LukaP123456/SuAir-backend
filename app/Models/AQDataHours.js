const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MeasurementSchema = new Schema({
    ts: Date,
    pm1: Number,
    pr: Number,
    hm: Number,
    tp: Number,
    aqius: Number,
    conc: Number
});

const HourSchema = new Schema({
    time: Date,
    hourly: [{
        type: MeasurementSchema,
    }],
    name: String,
}, {collection: 'hours-collection'});

module.exports = mongoose.model('HourMeasurement', HourSchema, 'days-collection')
