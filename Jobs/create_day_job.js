const cron = require('node-cron');
const {MongoClient} = require("mongodb");
require('dotenv').config();
const DayMeasurementModel = require('../app/Models/AQDataDay');
const HoursMeasurementModel = require('../app/Models/AQDataHours');
const tokens = [
    process.env.STUDIO_PRESENT_TOKEN,
    process.env.MAKSIMA_TOKEN,
    process.env.DESANKA_TOKEN,
]
const urls = tokens.map(token => process.env.COMMON_DEVICE_URL + token + '/validated-data')
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
        console.log(data[0].historical)

    } catch (error) {
        console.log(error);
    }
}

async function saveData(data) {
    const client = new MongoClient(process.env.MONGO_COMPASS_URI, {useUnifiedTopology: true});
    try {
        await client.connect();
        const db = client.db("iq-air-database");
        const coll = db.collection("days-collection");
        const timestamp = new Date().getTime();
        // const newHourMeasurement = new HoursMeasurementModel({
        //     time: timestamp,
        //     hourly: data.historical.hourly,
        //     name: data.name
        // });
        //
        // // Save newHourMeasurement instance to database
        // try {
        //     const result = await coll.insertOne(newHourMeasurement)
        //     console.log('Document saved:', result);
        // } catch (err) {
        //     console.error('Error saving document:', err);
        // }

        //TODO:
        // DAY
        // Daily is the average value of the whole day. How to get value for every hour for that particular day?
        // Create a day model which will have all the values of the day ( average value for every hour) and the average total value for that day.
        // HOURLY
        // Hourly doesnt return the value of only one day it returns the value of 3 days. How do i bind the hourly values of day 1?
        // INSTANT
        // Should we store instant value? Do we not need to know the air quality in this moment?
        // instant returns readings every 5 min.
        // MONTHLY
        // Also need to save average monthly value, value of the last 3 months is returned from the api. Do i need to bind average value of a day
        // to a month like i do with day and hour?
        // SOLUTION:With cron job save the daily data and hourly data in separate collections/models as a time series data and then extract the date from the time series data. Then
        // then create a regular Day model which will combine the two types of data by searching the Hourly time series data by the date of the day.

        // Create new DayMeasurementModel instance
        const newDayMeasurement = new DayMeasurementModel({
            time: timestamp,
            current: data.current,
            daily: data.historical.daily,
            hourly: data.historical.hourly,
            name: data.name
        });

        // Save newDayMeasurement instance to database
        try {
            const result = await coll.insertOne(newDayMeasurement)
            console.log('Document saved:', result);
        } catch (err) {
            console.error('Error saving document:', err);
        }
    } catch (error) {
        console.log(error);
    } finally {
        await client.close();
    }
}


getData()


// module.exports = getData




