const {AsyncParser} = require('@json2csv/node');
const fs = require('fs');
const MonthlyMeasurement = require('../Models/AQDataMonthly')
const DailyMeasurement = require('../Models/AQDataDaily')
const HourlyMeasurement = require('../Models/AQDataHourly')
const User = require('../Models/User')
const mongoose = require('mongoose')
const ExportLog = require("../Models/ExportLog");
const jwt = require('jsonwebtoken');
const moment = require("moment");

async function generateCSV(aqData) {
    const fields = [
        {label: 'Particular matter 1 concentration', value: 'particular_matter_1'},
        {label: 'Particular matter 10 concentration', value: 'particular_matter_10.concentration'},
        {label: 'Particular matter 10 AQI US ranking', value: 'particular_matter_10.aqi_us_ranking'},
        {label: 'Particular matter 25 concentration', value: 'particular_matter_25.concentration'},
        {label: 'Particular matter 25 AQI US ranking', value: 'particular_matter_25.aqi_us_ranking'},
        {label: 'Name of measuring device', value: 'name'},
        {label: 'Time of measurement', value: 'time_stamp'},
        {label: 'Air temperature in celsius', value: 'temperature'},
        {label: 'Air pressure', value: 'air_pressure'},
        {label: 'Air humidity', value: 'humidity'},
    ];
    const parser = new AsyncParser({fields});
    const data = await parser.parse(aqData).promise();
    const name = Math.random()
    console.log(name)
    fs.writeFileSync(name + '.csv', data);
}

//TODO:
//      2. Make a seeding system for time-series data to be able to test them

async function log_export_data(req, export_time_range, measuring_device) {
    let user = null
    let export_time = null
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1].trim();
        export_time = moment().format('YYYY-MM-DDTHH:mm:ssZ');
        user = jwt.verify(token, process.env.JWT_SECRET);
    } else {
        //Google auth
    }
    await new ExportLog({
        user_id: user.id,
        export_time: export_time,
        export_time_range: export_time_range,
        measuring_device: measuring_device
    }).save();
}

const getAll = async (req, res) => {
    try {
        const generate = req.query.generateCSV === 'true';
        const model_name_mapping = {
            Hour: 'HourlyMeasurement',
            Day: 'DailyMeasurement'
        };
        const model_name = model_name_mapping[req.query.modelName] || 'MonthlyMeasurement';
        const Model = mongoose.model(model_name);
        // Use the Model to perform a search
        const results = await Model.find({});
        if (generate) {
            await generateCSV(results);
            await log_export_data(req, null, "All devices");
        }
        res.send(results)
    } catch (error) {
        console.log(error)
    }
}
const xofAllTime = async (req, res) => {
    try {
        const model_name_mapping = {
            Hour: 'HourlyMeasurement',
            Day: 'DailyMeasurement'
        };
        const model_name = model_name_mapping[req.query.modelName] || 'MonthlyMeasurement';
        const worst_best = req.query.worst === 'true';
        const Model = mongoose.model(model_name);
        const results = await Model.find()
            .sort({
                'particular_matter_10.aqi_us_ranking': worst_best ? -1 : 1,
                'particular_matter_25.aqi_us_ranking': worst_best ? -1 : 1
            })
            .limit(1);
        res.send(results)
    } catch (error) {
        console.log(error)
    }
}
const getXInTime = async (req, res) => {
    try {
        //worst === true you get the worst day with the highest pollution
        //worst === false you get the best day with the lowest pollution
        const {start, end} = req.query
        const worst = req.query.worst === 'true';
        const device_name = req.query.device;
        const generate = req.query.generateCSV === 'true';
        const model_name_mapping = {
            Hour: 'HourlyMeasurement',
            Day: 'DailyMeasurement'
        };
        const model_name = model_name_mapping[req.query.model_name] || 'MonthlyMeasurement';
        const Model = mongoose.model(model_name);
        // Create a query object
        let query = {
            'time_stamp': {
                $gte: start,
                $lt: end
            }
        };
        //TOOD: Test export loging
        // Add a condition for device_name if it is truthy
        if (device_name) {
            query.name = {$regex: device_name, $options: 'i'};
        }
        // Execute the query
        const results = await Model.find(query).sort({
            'particular_matter_10.aqi_us_ranking': worst ? -1 : 1,
            'particular_matter_25.aqi_us_ranking': worst ? -1 : 1
        }).limit(1).exec()
        if (generate && results.length > 0) {
            await generateCSV(results);
            const timeRange = `${start} to ${end}`;
            await log_export_data(req, timeRange, results[0].name);
        }
        res.send(results)
    } catch (error) {
        console.log(error)
    }
}


const search = async (req, res) => {
    try {
        const query_mapping = {
            name: {field: 'name'},
            min_air_pressure: {field: 'air_pressure', operator: '$gte'},
            max_air_pressure: {field: 'air_pressure', operator: '$lte'},
            min_humidity: {field: 'humidity', operator: '$gte'},
            max_humidity: {field: 'humidity', operator: '$lte'},
            min_temperature: {field: 'temperature', operator: '$gte'},
            max_temperature: {field: 'temperature', operator: '$lte'},
            min_particular_matter_1: {field: 'particular_matter_1', operator: '$gte'},
            max_particular_matter_1: {field: 'particular_matter_1', operator: '$lte'},
            min_particular_matter_10_ranking: {field: 'particular_matter_10.aqi_us_ranking', operator: '$gte'},
            max_particular_matter_10_ranking: {field: 'particular_matter_10.aqi_us_ranking', operator: '$lte'},
            min_particular_matter_25_ranking: {field: 'particular_matter_25.aqi_us_ranking', operator: '$gte'},
            max_particular_matter_25_ranking: {field: 'particular_matter_25.aqi_us_ranking', operator: '$lte'},
            min_particular_matter_10_concentration: {field: 'particular_matter_10.concentration', operator: '$gte'},
            max_particular_matter_10_concentration: {field: 'particular_matter_10.concentration', operator: '$lte'},
            min_particular_matter_25_concentration: {field: 'particular_matter_25.concentration', operator: '$gte'},
            max_particular_matter_25_concentration: {field: 'particular_matter_25.concentration', operator: '$lte'}
        };
        const model_name_mapping = {
            Hour: 'HourlyMeasurement',
            Day: 'DailyMeasurement'
        };
        const model_name = model_name_mapping[req.query.model_name] || 'MonthlyMeasurement';
        const mongo_query = {};
        for (const [key, value] of Object.entries(req.query)) {
            const mapping = query_mapping[key];
            if (mapping) {
                if (key === 'name') {
                    mongo_query[mapping.field] = {$regex: value, $options: 'i'};
                } else if (mapping.operator) {
                    mongo_query[mapping.field] = {...mongo_query[mapping.field], [mapping.operator]: value};
                } else {
                    mongo_query[mapping.field] = value;
                }
            }
        }
        console.log(mongo_query)
        // Add sort option
        const sort = {};
        if (req.query.sort_by && req.query.order) {
            sort[req.query.sort_by] = req.query.order === 'asc' ? 1 : -1;
        }
        // Perform the search
        const Model = mongoose.model(model_name);
        // Use the Model to perform a search
        const results = await Model.find(mongo_query).sort(sort);
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
        const google_id = req.get('googleID')
        console.log(google_id)
        const item_id = req.body.itemID;
        if (google_id) {
            if (typeof item_id === 'string') {
                const update = {$pull: {[field]: item_id}};
                const user = await User.findByIdAndUpdate(google_id, update, {new: true});
                res.send(user);
            } else {
                const update = {$pullAll: {[field]: item_id}};
                const user = await User.findByIdAndUpdate(google_id, update, {new: true});
                res.send(user);
            }
        } else {
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
        }
    } catch (error) {
        console.log(error);
    }
}

const addFav = async (req, res, field) => {
    try {
        // When a user registers with Google auth the backend will send users id to the front. This id needs to be saved
        // in somewhere on the front. This value is then sent as googleID even though actually it's just users ID from the DB
        // IF the id is sent as googleID then that means the user used Google auth to register, if google_id is false then that means
        // user used regular registration.
        const google_id = req.get('googleID')
        const item_id = req.body.itemID;
        if (google_id) {
            const update = {$push: {[field]: item_id}};
            const user = await User.findByIdAndUpdate(google_id, update, {new: true});
            res.send(user);
        } else {
            const bearer_token = req.headers['authorization'];
            const payload = bearer_token.split('.')[1];
            const decoded_payload = Buffer.from(payload, 'base64').toString();
            const user_data = JSON.parse(decoded_payload);
            const user_id = user_data.id;
            const update = {$push: {[field]: item_id}};
            const user = await User.findByIdAndUpdate(user_id, update, {new: true});
            res.send(user);
        }
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
