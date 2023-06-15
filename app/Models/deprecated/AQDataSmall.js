const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const pm25Schema = new Schema({
    aqius: Number,
    concentration: Number
});

const windSchema = new Schema({
    speed: Number,
    direction: Number
});

const currentSchema = new Schema({
    ts: Date,
    aqius: Number,
    pm25: pm25Schema,
    mainus: String,
    condition: String,
    icon: String,
    humidity: Number,
    pressure: Number,
    temperature: Number,
    wind: windSchema
});

const hourlySchema = new Schema({
    ts: Date,
    aqius: Number,
    pm25: pm25Schema
});

const historicalSchema = new Schema({
    hourly: [hourlySchema]
});

const coordinatesSchema = new Schema({
    latitude: Number,
    longitude: Number
});

const SmallDataSchema = new Schema({
    time: Date,
    test_message: String,
    current: currentSchema,
    historical: historicalSchema,
    coordinates: coordinatesSchema,
    name: String,
    city: String
}, {timestamps: true, collection: 'iq-air-collection-ts'});

module.exports = mongoose.model('MeasurementSmall', SmallDataSchema, 'iq-air-collection-ts')
