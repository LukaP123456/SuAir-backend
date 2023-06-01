const AQdata = require('../Models/AQdata')
const {AsyncParser} = require('@json2csv/node');
const fs = require('fs');

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
    fs.writeFileSync('data.csv', data);
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
        const generate = req.body.genertateCSV === 'true';
        AQdata.find()
            .sort(worst ? '-pollution.aqius' : 'pollution.aqius')
            .limit(1)
            .exec((error, data) => {
                res.send(data)
            });
        if (generate) {
            await generateCSV(aqData);
        }
    } catch (error) {
        console.log(error)
    }
}
const getWorstInMonth = async (req, res) => {
    try {
        //worst === true you get the worst day with the highest pollution
        //worst === false you get the best day with the lowest pollution
        const {start, end} = req.body
        const worst = req.body.worst === 'true';
        const generate = req.body.genertateCSV === 'true';
        AQdata.find({
            'pollution.ts': {
                $gte: start,
                $lt: end
            }
        }).sort(worst ? '-pollution.aqius' : 'pollution.aqius')
            .limit(1)
            .exec((error, data) => {
                res.send(data)
            });
        if (generate) {
            await generateCSV(aqData);
        }
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    getAll, xofAllTime, getWorstInMonth
}
