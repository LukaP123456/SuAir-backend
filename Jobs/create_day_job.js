const mongoose = require('mongoose');
require('dotenv').config();
const Day = require('../app/Models/Day');
const HourlyMeasurement = require('../app/Models/AQDataHourly')

const names = [
    'IT Subotica 2030 - V. Nazora',
    'ITSU2030 - Desanke Maksimovic',
    'ITSU2030 - Studio Present'
]

const createDay = async () => {
    try {
        const current_date = new Date().toLocaleString()
        const day_data = []
        for (let i = 0; i < names.length; i++) {
            day_data.push(await getDataByNameAndDate(names[i]))
        }
        // await mongoose.connect(process.env.MONGO_COMPASS_URI, {useUnifiedTopology: true});
        // day_data.flat()
        // for (let i = 0; i < day_data.length; i++) {
        //     for (const element of day_data[i]) {
        //         const newDay = new Day({
        //             date: current_date,
        //             hourly: element.hourly,
        //             name: element.name,
        //         });
        //         const result = await newDay.save();
        //     }
        //
        // }
    } catch (error) {
        console.log('Error at getData: ', error);
    } finally {
        //Disconnect from the database
        await mongoose.disconnect()
    }
}

async function getDataByNameAndDate(name) {
    // Get the current date
    const currentDate = new Date();
    // Set the time to the start of the day
    currentDate.setHours(0, 0, 0, 0);

    // Create a new date object for the end of the day
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
        // Connect to the database
        await mongoose.connect(process.env.MONGO_COMPASS_URI, {useUnifiedTopology: true});
        // Query the database
        const results = await HourlyMeasurement.find({
            name: name,
            time: {$gte: currentDate, $lte: endOfDay},
        });

        const filteredResults = results.map(result => {
            const filteredHourly = result.hourly.filter(hourly => {
                const hourlyDate = new Date(hourly.ts);
                //TODO;
                // need to compare the dates correctly. Traverse the horuly array and compare every value in the array to see if it fits inside of the current date
                console.log(hourlyDate >= currentDate && hourlyDate <= endOfDay)
                return hourlyDate >= currentDate && hourlyDate <= endOfDay;
            });
            return {...result, hourly: filteredHourly};
        });
        // console.log(filteredResults)

    } catch (err) {
        // Handle error
        console.error(err);
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

createDay()

// module.exports = getData