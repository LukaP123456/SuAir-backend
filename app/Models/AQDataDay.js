const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const pmSchema = new Schema({
    aqius: Number,
    conc: Number
})
const MeasurementSchema = new Schema({
    ts: Date,
    pm1: Number,
    pr: Number,
    hm: Number,
    tp: Number,
    pm25: pmSchema,
    pm10: pmSchema,
});
const currentSchema = new Schema({
    pm25: pmSchema,
    pm10: pmSchema,
    pm1: pmSchema,
    pr: Number,
    hm: Number,
    tp: Number,
    ts: Date,
    mainus: String,
    aqius: Number,
});

const DaySchema = new Schema({
    time: Date,
    daily: [{
        type: MeasurementSchema,
    }],
    hourly: [{
        type: MeasurementSchema,
    }],
    current: currentSchema,
    name: String,
    favoredBy: [{type: mongoose.Types.ObjectId, ref: 'User'}]
}, {collection: 'days-collection'});

module.exports = mongoose.model('DayMeasurement', DaySchema, 'days-collection')
