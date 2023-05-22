const AQdata = require('../Models/AQdata')

const getAll = async (req, res) => {
    try {
        const aqData = await AQdata.find({})
        res.send(aqData)
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getAll
}
