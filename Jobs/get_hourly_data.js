const mongoose = require('mongoose');
require('dotenv').config();
const HourlyMeasurementModel = require('../app/Models/AQDataHourly');
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
            // const response = require(data_files[i]);
            // data.push(response)
            // const name = data[i].name
            // await saveData(name, data[i].historical.hourly);
            //FETCH DATA FROM URL RUNS EVERY 48 hours
            const response = await fetch(urls[i]);
            data.push(await response.json())
            await saveData(data[i], i);
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
            const newHourlyMeasurement = new HourlyMeasurementModel({
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
                await newHourlyMeasurement.save();
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


