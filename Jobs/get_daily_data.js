const mongoose = require('mongoose');
require('dotenv').config();
const moment = require('moment');
const DailyMeasurementModel = require('../app/Models/AQDataDaily');
const axios = require("axios");
const tokens = [
    process.env.STUDIO_PRESENT_TOKEN,
    process.env.MAKSIMA_TOKEN,
    process.env.DESANKA_TOKEN,
]
const urls = tokens.map(token => process.env.COMMON_DEVICE_URL + token)
const lat_long_urls = tokens.map(token => process.env.COMMON_DEVICE_URL + token + "/validated-data")
const data_files = [
    {data: '../test-data-json/stud-pres-big-data.json', lat_long_data: '../test-data-json/stud-pres-small-data.json'},
    {data: '../test-data-json/maksima-big-data.json', lat_long_data: '../test-data-json/maksima-small-data.json'},
    {data: '../test-data-json/desanka-big-data.json', lat_long_data: '../test-data-json/desanka-small-data.json'},
]
const get_daily_data = async (test) => {
    try {
        let data = []
        // await mongoose.connect(process.env.MONGO_COMPASS_URI);
        if (test) {
            console.log('==============TEST DAILY DATA============')
            for (let i = 0; i < data_files.length; i++) {
                //FETCH DATA FROM JSON FILES FOR TESTING
                const response = require(data_files[i].data);
                const lat_long_data = require(data_files[i].lat_long_data)
                const coordinates = lat_long_data.coordinates
                data.push(response)
                const name = data[i].name
                await saveData(name, data[i].historical.daily, coordinates);
            }
        } else {
            for (let i = 0; i < data_files.length; i++) {
                //FETCH DATA FROM URL Should run every 29 days
                const response = await axios.get(urls[i]);
                const lat_long_data = await axios.get(lat_long_urls[i]);
                const coordinates = lat_long_data.data.coordinates
                data.push(response.data);
                const name = data[i].name
                await saveData(name, data[i].historical.daily, coordinates);
            }
        }
    } catch (error) {
        console.log('Error at getData: ', error);
    }
    // } finally {
    //     await mongoose.disconnect();
    // }
}

async function saveData(name, data, coordinates) {
    try {
        const timestamp = moment().format('YYYY-MM-DDTHH:mm:ssZ');
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
                name: name,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
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
    }
}

// get_daily_data()
module.exports = get_daily_data