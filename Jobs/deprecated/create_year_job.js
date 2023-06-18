const mongoose = require('mongoose');
require('dotenv').config();
const Year = require('../../app/Models/deprecated/Year');
const MonthlyMeasurement = require('../../app/Models/AQDataMonthly')

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
                const newMonth = new Year({
                    date: current_date,
                    monthly: day_data[i].monthly,
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
        return await MonthlyMeasurement.aggregate([
            {
                $match: {
                    name: name
                }
            },
            {
                $addFields: {
                    monthly: {
                        $map: {
                            input: {
                                $filter: {
                                    input: "$monthly",
                                    as: "monthlyItem",
                                    cond: {
                                        $and: [
                                            {$eq: [{$year: "$$monthlyItem.ts"}, now.getFullYear()]}
                                        ]
                                    }
                                }
                            },
                            as: "monthlyItem",
                            in: {
                                time_stamp: "$$monthlyItem.ts",
                                particular_matter_1: "$$monthlyItem.pm1",
                                particular_matter_10: {
                                    aqi_us_ranking: "$$monthlyItem.pm10.aqius",
                                    concentration: "$$monthlyItem.pm10.conc"
                                },
                                particular_matter_25: {
                                    aqi_us_ranking: "$$monthlyItem.pm25.aqius",
                                    concentration: "$$monthlyItem.pm25.conc"
                                },
                                air_pressure: "$$monthlyItem.pr",
                                air_humidity: "$$monthlyItem.hm",
                                temperature: "$$monthlyItem.tp"
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