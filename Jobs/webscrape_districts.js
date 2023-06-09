const axios = require('axios');
require("dotenv").config()
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const District = require('../app/Models/District')
const uri = process.env.MONGO_COMPASS_URI;

// Connect to MongoDB using Mongoose
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
const url = 'https://www.planplus.rs/subotica/mesne-zajednice';

async function scrapeData() {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const divLeft = $('.masonry-left .box-item');
        const divRight = $('.masonry-right .box-item');
        let i = 0

        async function saveDistrictData(element) {
            const dataLat = $(element).attr('data-lat');
            const dataLng = $(element).attr('data-lng');
            const dataName = $(element).attr('data-name');

            const newDistrict = new District({
                latitude: dataLat,
                longitude: dataLng,
                name: dataName
            });

            await newDistrict.save();
            i++
            console.log('Data saved:', newDistrict, i);
        }

        divLeft.each(async (index, element) => {
            await saveDistrictData(element);
        });
        divRight.each(async (index, element) => {
            await saveDistrictData(element);
        });
    } catch (error) {
        console.log(error);
    }
}

scrapeData();

