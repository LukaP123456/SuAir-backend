const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const pmSchema = new Schema({
    aqi_us_ranking: Number,
    concentration: Number
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

const YearSchema = new Schema(
    {
        date: Date,
        monthly: [{
            type: MeasurementSchema,
        }],
        name: String,
    }
);

module.exports = mongoose.model('YearMeasurement', YearSchema, 'Years')
