const AQdata = require('../Models/deprecated/AQdataFree')
const {AsyncParser} = require('@json2csv/node');
const fs = require('fs');
const MonthlyMeasurement = require('../Models/AQDataMonthly')
const DailyMeasurement = require('../Models/AQDataDaily')
const HourlyMeasurement = require('../Models/AQDataHourly')
const User = require('../Models/User')
const mongoose = require('mongoose')

//TODO: Need to log user data->browser,ip address,web or mobile etc.
// Also need to log the data which is downloaded->Marko Markovic downaloded on DATE this data->DATA in this format

async function generateCSV(aqData) {
    console.log(aqData)
    const fields = [
        {label: 'Particular matter 1 concentration', value: 'particular_matter_1'},
        {label: 'Particular matter 10 concentration', value: 'particular_matter_10.concentration'},
        {label: 'Particular matter 10 AQI US ranking', value: 'particular_matter_10.aqi_us_ranking'},
        {label: 'Particular matter 25 concentration', value: 'particular_matter_25.concentration'},
        {label: 'Particular matter 25 AQI US ranking', value: 'particular_matter_25.aqi_us_ranking'},
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
        const generate = req.query.generateCSV === 'true';
        const model_name_mapping = {
            Hour: 'HourlyMeasurement',
            Day: 'DailyMeasurement'
        };
        const model_name = model_name_mapping[req.query.model_name] || 'MonthlyMeasurement';
        const Model = mongoose.model(model_name);
        const results = await Model.find({
            'time_stamp': {
                $gte: start,
                $lt: end
            }
        }).sort({
            'particular_matter_10.aqi_us_ranking': worst ? -1 : 1,
            'particular_matter_25.aqi_us_ranking': worst ? -1 : 1
        }).limit(1).exec()
        if (generate) {
            await generateCSV(results);
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
        //TODO: When a user registers with google auth the backend will send users id to the front. This id needs to be saved
        // in somewhere on the front. This value is then sent as googleID even though actually it's just users ID from the DB
        // IF the id is sent as googleID then that means the user used google auth to register, if google_id is false then that means
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
