const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const pmSchema = new Schema({
    aqi_us_ranking: Number,
    concentration: Number
})

const HourlySchema = new Schema(
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

module.exports = mongoose.model('HourlyMeasurement', HourlySchema, 'hourly-collection-ts')
