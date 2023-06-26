const mongoose = require('mongoose');
require('dotenv').config();
const DailyMeasurementModel = require('../app/Models/AQDataDaily');
const tokens = [
    process.env.STUDIO_PRESENT_TOKEN,
    process.env.MAKSIMA_TOKEN,
    process.env.DESANKA_TOKEN,
]
const urls = tokens.map(token => process.env.COMMON_DEVICE_URL + token)
const data_files = [
    '../test-data-json/stud-pres-big-data.json',
    '../test-data-json/maksima-big-data.json',
    '../test-data-json/desanka-big-data.json',
]
const getData = async () => {
    try {
        let data = []
        for (let i = 0; i < data_files.length; i++) {
            //FETCH DATA FROM JSON FILES FOR TESTING
            const response = require(data_files[i]);
            data.push(response)
            const name = data[i].name
            await saveData(name, data[i].historical.daily, i);
            //FETCH DATA FROM URL Should run every 29 days
            // const response = await fetch(urls[i]);
            // data.push(await response.json())
            // await saveData(data[i]);
        }
    } catch (error) {
        console.log('Error at getData: ', error);
    }
}

async function saveData(name, data) {
    try {
        await mongoose.connect(process.env.MONGO_COMPASS_URI);
        const timestamp = new Date().toLocaleString()
        let times_saved = ""
        console.log(name)
        for (let i = 0; i < data.length; i++) {
            const newDailyMeasurement = new DailyMeasurementModel({
                cron_job_timestamp: timestamp,
                time_stamp: data[i].ts,
                particular_matter_1: data[i].pm1,
                particular_matter_10: {
                    aqi_us_ranking: data[i].pm10.aqius,
                    concentration: data[i].pm10.conc
                },
                particular_matter_25: {
                    aqi_us_ranking: data[i].pm25.aqius,
                    concentration: data[i].pm25.conc
                }, air_pressure: data[i].pr,
                humidity: data[i].hm,
                temperature: data[i].tp,
                name: name
            })
            try {
                await newDailyMeasurement.save();
                times_saved += i + " "
            } catch (err) {
                console.log(err);
            }
        }
        console.log(times_saved);
    } catch (error) {
        console.log('Error at the start of saveData: ', error);
    } finally {
        await mongoose.disconnect();
    }
}

getData()
// module.exports = getData

//TODO:
// ===============================================================================================
// DAY
// Daily is the average value of the whole day. How to get value for every hour for that particular day?
// Create a day model which will have all the values of the day ( average value for every hour) and the average total value for that day.
// ===============================================================================================
// HOURLY
// Hourly doesnt return the value of only one day it returns the value of 3 days. How do i bind the hourly values of day 1?
// INSTANT
// ===============================================================================================
// Should we store instant value? Do we not need to know the air quality in this moment?
// instant returns readings every 5 min.
// MONTHLY
// ===============================================================================================
// Also need to save average monthly value, value of the last 3 months is returned from the api. Do i need to bind average value of a day
// to a month like i do with day and hour?
// ===============================================================================================
// SOLUTION:With cron job save the daily data and hourly data in separate collections/models as a time series data and then extract the date from the time series data. Then
// create a regular Day model which will combine the two types of data by searching the Hourly time series data by the date of the day.
// ===============================================================================================
// SOLUTION 2:
// Fetch the current data from the api and then manually create daily,monthly,yearly data instead of fetching it from the api
// problem-> don't know how to calculate aqius ranking also bad at math



