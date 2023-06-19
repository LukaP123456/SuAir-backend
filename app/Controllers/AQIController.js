const AQdata = require('../Models/deprecated/AQdataFree')
const {AsyncParser} = require('@json2csv/node');
const fs = require('fs');
const MonthlyMeasurement = require('../Models/AQDataMonthly')
const DailyMeasurement = require('../Models/AQDataDaily')
const HourlyMeasurement = require('../Models/AQDataHourly')
const mongoose = require('mongoose')

async function generateCSV(aqData) {
    const fields = [
        {label: 'AQI Value', value: 'pollution.aqius'},
        {label: 'Main US pollutant', value: 'pollution.mainus'},
        {label: 'Temperature', value: 'weather.tp'},
        {label: 'Time of measurement', value: 'time'},
        {label: 'Air temperature in celsius', value: 'weather.tp'},
        {label: 'Air pressure', value: 'weather.pr'},
        {label: 'Air humidity', value: 'weather.hu'},
        {label: 'Wind speed', value: 'weather.ws'},
        {label: 'Wind direction', value: 'weather.wd'},
    ];
    const parser = new AsyncParser({fields});
    const data = await parser.parse(aqData).promise();
    const name = Math.random()
    console.log(name)
    fs.writeFileSync(name + '.csv', data);
}

const getAll = async (req, res) => {
    try {
        const generate = req.body.genertateCSV === 'true';
        const aqData = await AQdata.find({});
        if (generate) {
            await generateCSV(aqData);
        }
        res.send(aqData)
    } catch (error) {
        console.log(error)
    }
}
const xofAllTime = async (req, res) => {
    try {
        const worst = req.body.worst === 'true';
        const generate = req.body.generateCSV === 'true'
        AQdata.find()
            .sort(worst ? '-pollution.aqius' : 'pollution.aqius')
            .limit(1)
            .exec(async (error, data) => {
                if (generate) {
                    await generateCSV(data);
                }
                res.send(data)
            });

    } catch (error) {
        console.log(error)
    }
}
const getXInTime = async (req, res) => {
    try {
        //worst === true you get the worst day with the highest pollution
        //worst === false you get the best day with the lowest pollution
        const {start, end} = req.body
        const worst = req.body.worst === 'true';
        const generate = req.body.generateCSV === 'true';
        AQdata.find({
            'pollution.ts': {
                $gte: start,
                $lt: end
            }
        }).sort(worst ? '-pollution.aqius' : 'pollution.aqius')
            .limit(1)
            .exec(async (error, data) => {
                if (generate) {
                    await generateCSV(data);
                }
                res.send(data)
            });
    } catch (error) {
        console.log(error)
    }
}

const search = async (req, res) => {
    try {
        const {
            model_name,
            name,
            min_air_pressure,
            max_air_pressure,
            min_humidity,
            max_humidity,
            min_temperature,
            max_temperature,
            min_particular_matter_1,
            max_particular_matter_1,
            min_particular_matter_25_ranking,
            max_particular_matter_25_ranking,
            min_particular_matter_25_concentration,
            max_particular_matter_25_concentration,
            min_particular_matter_10_concentration,
            max_particular_matter_10_concentration
        } = req.query

        console.log(model_name)
        // Build the query object
        const mongo_query = {};
        if (name) {
            mongo_query.name = name;
        }
        if (min_air_pressure) {
            mongo_query.humidity = {$gte: min_air_pressure};
        }
        if (max_air_pressure) {
            mongo_query.humidity = {...mongo_query.humidity, $lte: max_air_pressure};
        }
        if (min_humidity) {
            mongo_query.humidity = {$gte: min_humidity};
        }
        if (max_humidity) {
            mongo_query.humidity = {...mongo_query.humidity, $lte: max_humidity};
        }
        if (min_temperature) {
            mongo_query.temperature = {$gte: min_temperature};
        }
        if (max_temperature) {
            mongo_query.temperature = {...mongo_query.temperature, $lte: max_temperature};
        }
        if (min_particular_matter_1) {
            mongo_query.particular_matter_1 = {$gte: min_particular_matter_1};
        }
        if (max_particular_matter_1) {
            mongo_query.particular_matter_1 = {...mongo_query.particular_matter_1, $lte: max_particular_matter_1};
        }
        if (min_particular_matter_25_ranking) {
            mongo_query["particular_matter_25.aqi_us_ranking"] = {$gte: min_particular_matter_25_ranking};
        }
        if (max_particular_matter_25_ranking) {
            mongo_query["particular_matter_25.aqi_us_ranking"] = {
                ...mongo_query["particular_matter_25.aqi_us_ranking"],
                $lte: max_particular_matter_25_ranking
            };
        }
        if (min_particular_matter_25_concentration) {
            mongo_query["particular_matter_25.concentration"] = {$gte: min_particular_matter_25_concentration};
        }
        if (max_particular_matter_25_concentration) {
            mongo_query["particular_matter_25.concentration"] = {
                ...mongo_query["particular_matter_25.concentration"],
                $lte: max_particular_matter_25_concentration
            };
        }
        if (min_particular_matter_10_concentration) {
            mongo_query["particular_matter_10.concentration"] = {$gte: min_particular_matter_10_concentration};
        }
        if (max_particular_matter_10_concentration) {
            mongo_query["particular_matter_10.concentration"] = {
                ...mongo_query["particular_matter_10.concentration"],
                $lte: max_particular_matter_10_concentration
            };
        }
        // Perform the search
        const Model = mongoose.model(model_name);
        console.log(Model)
        // Use the Model to perform a search
        const results = await Model.find(mongo_query);
        console.log(mongo_query)
        res.send(results);
    } catch (error) {
        console.log(error)
    }
}

const AddRemoveFavorite = async (req, res) => {
    try {
        const field = req.params.field;
        const operation = req.method
        switch (operation) {
            case 'PUT':
                if (['favoriteHour', 'favoriteDay', 'favoriteMonth'].includes(field)) {
                    addFav(req, res, field);
                } else {
                    res.status(400).send('Invalid field');
                }
                break;
            case 'DELETE':
                if (['favoriteHour', 'favoriteDay', 'favoriteMonth'].includes(field)) {
                    removeFav(req, res, field);
                } else {
                    res.status(400).send('Invalid field');
                }
                break;
            default:
                res.status(400).send('Invalid operation');
        }
    } catch (error) {
        console.log(error)
    }
}
const removeFav = async (req, res, field) => {
    try {
        const item_id = req.body.itemID;
        const bearer_token = req.headers['authorization'];
        const payload = bearer_token.split('.')[1];
        const decoded_payload = Buffer.from(payload, 'base64').toString();
        const user_data = JSON.parse(decoded_payload);
        const user_id = user_data.id;
        if (typeof item_id === 'string') {
            const update = {$pull: {[field]: item_id}};
            const user = await User.findByIdAndUpdate(user_id, update, {new: true});
            res.send(user);
        } else {
            const update = {$pullAll: {[field]: item_id}};
            const user = await User.findByIdAndUpdate(user_id, update, {new: true});
            res.send(user);
        }
    } catch (error) {
        console.log(error);
    }
}
const addFav = async (req, res, field) => {
    try {
        const item_id = req.body.itemID;
        const bearer_token = req.headers['authorization'];
        const payload = bearer_token.split('.')[1];
        const decoded_payload = Buffer.from(payload, 'base64').toString();
        const user_data = JSON.parse(decoded_payload);
        const user_id = user_data.id;
        const update = {$push: {[field]: item_id}};
        const user = await User.findByIdAndUpdate(user_id, update, {new: true});
        res.send(user);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    getAll,
    xofAllTime,
    getXInTime,
    AddRemoveFavorite,
    search
}
