const cron = require('node-cron');
const {MongoClient} = require("mongodb");
require('dotenv').config();
const MeasurementModel = require('../app/Models/AQdata');

const API_KEY = process.env.API_KEY;
const CITY = process.env.CITY;
const STATE = process.env.STATE;
const COUNTRY = process.env.COUNTRY;
const URL = `http://api.airvisual.com/v2/city?city=${CITY}&state=${STATE}&country=${COUNTRY}&key=${API_KEY}` //https://api-docs.iqair.com/

const DATABASE_URL = process.env.COMPASS_URI
const client = new MongoClient(DATABASE_URL, {useUnifiedTopology: true});

const getData = async () => {
    try {
        const response = await fetch(URL);
        const data = await response.json();
        // Extract relevant data
        const currentData = data.data.current
        // Save data to database
        await saveData(currentData);
    } catch (error) {
        console.log(error);
    }
}

async function saveData(data) {
    try {
        await client.connect();
        // database and collection code goes here
        const db = client.db("iq-air-database");
        const coll = db.collection("iq-air-collection-ts");
        const timestamp = new Date().getTime();
        const time_added = new Date();
        //Insert data
        const newMeasurement = new MeasurementModel({
            time: timestamp,
            test_message: "Data added at: " + time_added,
            pollution: {
                ts: new Date(data.pollution.ts),
                aqius: data.pollution.aqius,
                mainus: data.pollution.mainus,
            },
            weather: {
                ts: new Date(data.weather.ts),
                tp: data.weather.tp,
                pr: data.weather.pr,
                hu: data.weather.hu,
                ws: data.weather.ws,
                wd: data.weather.wd,
            },
        });
        const result = await coll.insertOne(newMeasurement)
        console.log(result.ops[0])
    } catch (error) {
        console.log(error)
    }
}


module.exports = getData




