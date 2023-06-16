const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const pmSchema = new Schema({
    aqius: Number,
    conc: Number
})

const MeasurementSchema = new Schema({
    time_stamp: Date,
    particular_matter_1: Number,
    particular_matter_10: pmSchema,
    particular_matter_25: pmSchema,
    air_pressure: Number,
    air_humidity: Number,
    temperature: Number,
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
