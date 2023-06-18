const mongoose = require('mongoose');
require('dotenv').config();
const Month = require('../../app/Models/deprecated/Month');
const DailyMeasurement = require('../../app/Models/AQDataDaily')

const names = [
    'IT Subotica 2030 - V. Nazora',
    'ITSU2030 - Desanke Maksimovic',
    'ITSU2030 - Studio Present'
]

//THIS FUNCTION NEEDS TO RUN EVERY 29 days
//Fetches data from the DB and creates a Month object in the DB based on the time series data retrieved
//The time series data received from the api returns exactly 15 days in one month and 15 days in another
const createDay = async () => {
    try {
        const current_date = new Date().toLocaleString()
        let day_data = []
        for (let i = 0; i < names.length; i++) {
            day_data.push(await getDataByNameAndDate(names[i]))
        }
        day_data = day_data.flat()
        try {
            await mongoose.connect(process.env.MONGO_COMPASS_URI);
            for (let i = 0; i < day_data.length; i++) {
                const newMonth = new Month({
                    date: current_date,
                    daily: day_data[i].daily,
                    name: day_data[i].name,
                });
                const result = await newMonth.save();
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
    try {
        // Connect to the database
        await mongoose.connect(process.env.MONGO_COMPASS_URI);
        // Query the database
        const now = new Date();
        return await DailyMeasurement.aggregate([
            {
                $match: {
                    name: name
                }
            },
            {
                $addFields: {
                    daily: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$daily",
                                    as: "dailyItem",
                                    cond: {
                                        $and: [
                                            {$eq: [{$month: "$$dailyItem.ts"}, now.getMonth() + 1]},
                                            {$eq: [{$year: "$$dailyItem.ts"}, now.getFullYear()]}
                                        ]
                                    }
                                }
                            },
                            as: "dailyItem",
                            in: {
                                time_stamp: "$$dailyItem.ts",
                                particular_matter_1: "$$dailyItem.pm1",
                                particular_matter_10: {
                                    aqi_us_ranking: "$$dailyItem.pm10.aqius",
                                    concentration: "$$dailyItem.pm10.conc"
                                },
                                particular_matter_25: {
                                    aqi_us_ranking: "$$dailyItem.pm25.aqius",
                                    concentration: "$$dailyItem.pm25.conc"
                                },
                                air_pressure: "$$dailyItem.pr",
                                air_humidity: "$$dailyItem.hm",
                                temperature: "$$dailyItem.tp"
                            }
                        }
                    }
                }
            }
        ])
    } catch (err) {
        // Handle error
        console.error(err);
    }
}

createDay()

// module.exports = createDay