const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const pmSchema = new Schema({
    aqi_us_ranking: Number,
    concentration: Number
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

const MonthlySchema = new Schema(
    {
        cron_job_timestamp: Date,
        time_stamp: Date,
        particular_matter_1: Number,
        particular_matter_10: pmSchema,
        particular_matter_25: pmSchema,
        air_pressure: Number,
        humidity: Number,
        temperature: Number,
        name: String,
        latitude: String,
        longitude: String,
    },
    {
        timeseries: {
            timeField: 'cron_job_timestamp',
        },
    }
);

module.exports = mongoose.model('MonthlyMeasurement', MonthlySchema, 'monthly-collection-ts')
