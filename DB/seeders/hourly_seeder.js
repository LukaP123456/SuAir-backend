const mongoose = require('mongoose')
const moment = require('moment');
const HourlyMeasurementModel = require('../../app/Models/AQDataHourly');
require('dotenv').config();

async function seedData() {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_COMPASS_URI);
    // Define the base data for the documents
    const baseData = {
        cron_job_timestamp: new Date(),
        particular_matter_25: {
            aqi_us_ranking: 33,
            concentration: 8,
        },
        name: 'ITSU2030 - Studio Present',
        latitude: '46.0952',
        longitude: '19.655',
        temperature: 25,
        particular_matter_1: 6,
        particular_matter_10: {
            aqi_us_ranking: 13,
            concentration: 14,
        },
        humidity: 45,
        air_pressure: 100036,
    };
    // Define the start and end dates for the time series data
    const startDate = moment('2022-01-01');
    const endDate = moment('2022-12-31');
    // Generate one document for each hour in the date range
    for (let date = startDate; date.isBefore(endDate); date.add(1, 'hour')) {
        const data = {...baseData, time_stamp: date.toDate()};
        await HourlyMeasurementModel.create(data);
    }
    // Disconnect from MongoDB
    await mongoose.disconnect();
}

// seedData()
