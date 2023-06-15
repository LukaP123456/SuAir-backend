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

const HourlySchema = new Schema(
    {
        time: Date,
        hourly: [{
            type: MeasurementSchema,
        }],
        name: String,
    },
    {
        timeseries: {
            timeField: 'time',
        },
    }
);

module.exports = mongoose.model('HourlyMeasurement', HourlySchema, 'hourly-collection-ts')
