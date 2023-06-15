const mongoose = require('mongoose');
require('dotenv').config();
const MonthlyMeasurementModel = require('../app/Models/AQDataMonthly');
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
            await saveData(data[i]);
            //FETCH DATA FROM URL
            // const response = await fetch(urls[i]);
            // data.push(await response.json())
            // await saveData(data[i]);
        }
    } catch (error) {
        console.log('Error at getData: ', error);
    }
}

async function saveData(data) {
    try {
        await mongoose.connect(process.env.MONGO_COMPASS_URI, {useUnifiedTopology: true});
        const timestamp = new Date().toLocaleString()
        const newDailyMeasurement = new MonthlyMeasurementModel({
            time: timestamp,
            monthly: data.historical.monthly,
            name: data.name
        })
        try {
            await newDailyMeasurement.save();
            console.log('saved data');
        } catch (err) {
            console.log(err);
        }
        // console.log(result)
    } catch (error) {
        console.log('Error at the start of saveData: ', error);
    } finally {
        await mongoose.disconnect();
    }
}

getData()
// module.exports = getData
