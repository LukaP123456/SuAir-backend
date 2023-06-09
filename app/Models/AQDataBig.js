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
const historicalSchema = new Schema({
    time: Date,
    test_message: String,
    daily: [MeasurementSchema],
    hourly: [MeasurementSchema],
    monthly: [MeasurementSchema],
    instant: [MeasurementSchema],
    name: String,
    current: currentSchema
});

const BigDataSchema = new Schema({
    time: Date,
    test_message: String,
    historical: historicalSchema,
    name: String,
    current: currentSchema
}, {timestamps: true, collection: 'iq-air-collection-ts'});

module.exports = mongoose.model('MeasurementBig', BigDataSchema, 'iq-air-collection-ts')
