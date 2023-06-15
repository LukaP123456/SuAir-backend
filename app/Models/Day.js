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

const DaySchema = new Schema(
    {
        date: Date,
        hourly: [{
            type: MeasurementSchema,
        }],
        name: String,
    }
);

module.exports = mongoose.model('DayMeasurement', DaySchema, 'Days')
