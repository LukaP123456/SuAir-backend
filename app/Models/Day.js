const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const DaySchema = new Schema(
    {
        name: String,
    }
);

module.exports = mongoose.model('DayMeasurement', DaySchema, 'Days')
