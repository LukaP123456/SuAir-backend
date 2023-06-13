const cron = require('node-cron');
const {MongoClient} = require("mongodb");
require('dotenv').config();
const SmallMeasurementModel = require('../app/Models/AQDataSmall');
const tokens = [
    process.env.STUDIO_PRESENT_TOKEN,
    process.env.MAKSIMA_TOKEN,
    process.env.DESANKA_TOKEN,
]
const urls = tokens.map(token => process.env.COMMON_DEVICE_URL + token + '/validated-data')
const data_files = [
    '../test-data-json/stud-pres-small-data.json',
    '../test-data-json/maksima-small-data.json',
    '../test-data-json/desanka-small-data.json',
]
const getData = async () => {
    try {
        let data = []
        for (let i = 0; i < data_files.length; i++) {
            //FETCH DATA FROM JSON FILES FOR TESTING
            // const response = require(data_files[i]);
            // data.push(response)
            // await saveData(data[i]);

            //FETCH DATA FROM URL
            const response = await fetch(urls[i]);
            data.push(await response.json())
            await saveData(data[i]);
        }

    } catch (error) {
        console.log(error);
    }
}

async function saveData(data) {
    const client = new MongoClient(process.env.MONGO_COMPASS_URI, {useUnifiedTopology: true});
    try {
        console.log(data)
        await client.connect();
        // database and collection code goes here
        const db = client.db("iq-air-database");
        const coll = db.collection("iq-air-collection-ts");
        const timestamp = new Date().getTime();
        const time_added = new Date();
        console.log(data.current)
        //Insert data
        const newMeasurement = new SmallMeasurementModel({
            time: timestamp,
            test_message: "Data added at: " + time_added,
            current: data.current,
            historical: data.historical.hourly,
            coordinates: data.coordinates,
            name: data.name,
            city: data.city
        });
        const result = await coll.insertOne(newMeasurement)
        console.log(result.ops[0])
    } catch (error) {
        console.log(error)
    } finally {
        await client.close();
    }
}

getData()


// module.exports = getData



