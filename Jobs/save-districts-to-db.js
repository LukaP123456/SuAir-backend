require("dotenv").config()
const mongoose = require("mongoose");
const District = require('../app/Models/District')

const uri = process.env.MONGO_COMPASS_URI;

async function saveDistrictToDB() {
    const districts = require('../districts.json')
    console.log(districts)
    // // Connect to MongoDB database
    mongoose.connect(uri, {
        dbName: 'iq-air-database',
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Connection error:'));
    db.once('open', () => {
        console.log('Connected to MongoDB');
    });
    // // Insert JSON array into database
    await District.insertMany(districts);

    // // Close connection
    await mongoose.disconnect();
}

saveDistrictToDB();
