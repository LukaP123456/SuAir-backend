const mongoose = require('mongoose');
require('dotenv').config();
const DailyMeasurementModel = require('../app/Models/AQDataDaily');

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
        const timestamp = new Date().getTime();
        const newDailyMeasurement = new DailyMeasurementModel({
            time: timestamp,
            daily: data.historical.daily,
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