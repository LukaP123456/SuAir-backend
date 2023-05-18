require("dotenv").config()
const mongoose = require("mongoose");
const District = require('../app/Models/District')

const uri = process.env.MONGO_COMPASS_URI;

async function importCsvToDatabase() {
    const districts = require('../districts.json')
    console.log(districts)
    // // Connect to MongoDB database
    mongoose.connect(uri, {
        dbName: 'iq-air-database',
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    // // Insert JSON array into database
    await District.insertMany(districts);

    // // Close connection
    await mongoose.disconnect();
}

importCsvToDatabase();
