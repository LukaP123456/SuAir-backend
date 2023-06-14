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

const DailySchema = new Schema(
    {
        time: Date,
        daily: [{
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

module.exports = mongoose.model('DailyMeasurement', DailySchema, 'daily-collection-ts')
