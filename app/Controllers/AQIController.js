const AQdata = require('../Models/deprecated/AQdataFree')
const {AsyncParser} = require('@json2csv/node');
const fs = require('fs');
const User = require('../Models/User')

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
const AddFavHour = async (req, res) => {
    addFav(req, res, 'favoriteHour'); // update favoriteHour field
}
const AddFavDay = async (req, res) => {
    addFav(req, res, 'favoriteDay'); // update favoriteHour field
}
const AddFavMonth = async (req, res) => {
    addFav(req, res, 'favoriteMonth'); // update favoriteHour field
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
const RemoveFavHour = async (req, res) => {
    removeFav(req, res, 'favoriteHour'); // update favoriteHour field
}
const RemoveFavDay = async (req, res) => {
    removeFav(req, res, 'favoriteDay'); // update favoriteHour field
}
const RemoveFavMonth = async (req, res) => {
    removeFav(req, res, 'favoriteMonth'); // update favoriteHour field
}
const removeFav = async (req, res, field) => {
    try {
        const item_id = req.body.itemID;
        const bearer_token = req.headers['authorization'];
        const payload = bearer_token.split('.')[1];
        const decoded_payload = Buffer.from(payload, 'base64').toString();
        const user_data = JSON.parse(decoded_payload);
        const user_id = user_data.id;
        const update = {$pullAll: {[field]: item_id}};
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
    AddFavHour,
    AddFavDay,
    AddFavMonth,
    RemoveFavHour,
    RemoveFavDay,
    RemoveFavMonth
}
