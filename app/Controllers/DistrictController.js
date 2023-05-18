const District = require('../Models/District')


const getAll = async (req, res) => {
    try {
        const districts = await District.find({})
        res.send(districts)
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getAll
}