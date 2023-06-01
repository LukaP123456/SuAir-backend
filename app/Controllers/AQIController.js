const AQdata = require('../Models/AQdata')

const getAll = async (req, res) => {
    try {
        const aqData = await AQdata.find({})
        res.send(aqData)
    } catch (error) {
        console.log(error)
    }
}
const xofAllTime = async (req, res) => {
    try {
        const worst = req.body.worst === 'true';
        AQdata.find()
            .sort(worst ? '-pollution.aqius' : 'pollution.aqius')
            .limit(1)
            .exec((error, data) => {
                res.send(data)
            });
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
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    getAll, xofAllTime, getWorstInMonth
}
