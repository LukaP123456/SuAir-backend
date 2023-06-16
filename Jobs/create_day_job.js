const mongoose = require('mongoose');
require('dotenv').config();
const Day = require('../app/Models/Day');
const HourlyMeasurement = require('../app/Models/AQDataHourly')

const names = [
    'IT Subotica 2030 - V. Nazora',
    'ITSU2030 - Desanke Maksimovic',
    'ITSU2030 - Studio Present'
]

//THIS FUNCTION NEEDS TO RUN EVERY 24H
//Fetches data from the DB and creates a Day object in the DB based on the time series data retrieved
const createDay = async () => {
    try {
        const current_date = new Date('2023-06-14T12:00:00.000+00:00').toLocaleString()
        let day_data = []
        for (let i = 0; i < names.length; i++) {
            day_data.push(await getDataByNameAndDate(names[i]))
        }
        day_data = day_data.flat()
        try {
            await mongoose.connect(process.env.MONGO_COMPASS_URI);
            for (let i = 0; i < day_data.length; i++) {
                const newDay = new Day({
                    date: current_date,
                    hourly: day_data[i].hourly,
                    name: day_data[i].name,
                });
                const result = await newDay.save();
                console.log(result)
            }
        } catch (error) {
            console.log(error)
        }
    } catch (error) {
        console.log('Error at getData: ', error);
    } finally {
        //Disconnect from the database
        await mongoose.disconnect()
    }
}

async function getDataByNameAndDate(name) {
    const now = new Date('2023-06-14T12:00:00.000+00:00');
    try {
        // Connect to the database
        await mongoose.connect(process.env.MONGO_COMPASS_URI, {useUnifiedTopology: true});
        // Query the database
        const now = new Date();
        //TODO:Check why only 9 hours are returned and not 24
        const result = await HourlyMeasurement.aggregate([
            {
                $match: {
                    name: name
                }
            },
            {
                $addFields: {
                    hourly: {
                        $filter: {
                            input: "$hourly",
                            as: "hourlyItem",
                            cond: {
                                $and: [
                                    {$eq: [{$dayOfMonth: "$$hourlyItem.ts"}, now.getDate()]},
                                    {$eq: [{$month: "$$hourlyItem.ts"}, now.getMonth() + 1]},//getMonth() returns 0-11
                                    {$eq: [{$year: "$$hourlyItem.ts"}, now.getFullYear()]}
                                ]
                            }
                        }
                    }
                }
            }
        ])
        console.log(result)
        // return await HourlyMeasurement.aggregate([
        //     {
        //         $match: {
        //             name: name
        //         }
        //     },
        //     {
        //         $addFields: {
        //             hourly: {
        //                 $map: {
        //                     input: {
        //                         $filter: {
        //                             input: "$hourly",
        //                             as: "hourlyItem",
        //                             cond: {
        //                                 $and: [
        //                                     {$eq: [{$dayOfMonth: "$$hourlyItem.ts"}, now.getDate()]},
        //                                     {$eq: [{$month: "$$hourlyItem.ts"}, now.getMonth() + 1]},
        //                                     {$eq: [{$year: "$$hourlyItem.ts"}, now.getFullYear()]}
        //                                 ]
        //                             }
        //                         }
        //                     },
        //                     as: "hourlyItem",
        //                     in: {
        //                         time_stamp: "$$hourlyItem.ts",
        //                         particular_matter_1: "$$hourlyItem.pm1",
        //                         particular_matter_10: "$$hourlyItem.pm10",
        //                         particular_matter_25: "$$hourlyItem.pm25",
        //                         air_pressure: "$$hourlyItem.pr",
        //                         air_humidity: "$$hourlyItem.hm",
        //                         temperature: "$$hourlyItem.tp"
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // ])
    } catch (err) {
        // Handle error
        console.error(err);
    }
}

createDay()

// module.exports = createDay