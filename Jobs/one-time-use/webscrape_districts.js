const axios = require('axios');
require("dotenv").config()
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const District = require('../../app/Models/District')

const url = 'https://www.planplus.rs/subotica/mesne-zajednice';

async function scrape_data() {
    // Connect to MongoDB using Mongoose
    await mongoose.connect(process.env.MONGO_COMPASS_URI)
    try {
        console.log('===DSITRICTS JOB STARTED===')
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

module.exports = scrape_data

