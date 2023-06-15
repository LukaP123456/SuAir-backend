const mongoose = require('mongoose');
const {MongoClient} = require('mongodb');
const Schema = mongoose.Schema;

async function connectToDatabase() {
    await mongoose.connect('mongodb://lukaprcic:compassPass@localhost:27017/?authMechanism=DEFAULT');
}

//
// async function collectionExists(collectionName) {
//     const client = new MongoClient('mongodb://lukaprcic:compassPass@localhost:27017/?authMechanism=DEFAULT');
//     await client.connect();
//     const db = client.db('iq-air-database');
//
//     const collections = await db.listCollections().toArray();
//     const collectionNames = collections.map(collection => collection.name);
//
//     await client.close();
//
//     return collectionNames.includes(collectionName);
// }
//
// async function createCollection() {
//     const exists = await collectionExists('luka-test-ts');
//     if (!exists) {
//         const db = mongoose.connection.db;
//         console.log(db)
//         await db.createCollection('luka-test-ts', {
//             timeseries: {
//                 timeField: 'timestamp'
//             }
//         });
//     }
// }

const schema = Schema(
    {
        calculated_at: Date,
        temperature: Number,
        metadata: {
            sensorId: String,
            location: String,
        },
    },
    {
        timeseries: {
            timeField: 'calculated_at',
            metaField: 'metadata',
            granularity: 'hours',
        },
    }
);

const TimeSeriesModel = mongoose.model('TimeSeries', schema, 'luka-test-ts');

async function insertData(timestamp, value) {
    const data = new TimeSeriesModel({calculated_at: timestamp, value});
    await data.save();
}

// Example usage:
async function main() {
    await connectToDatabase();
    // await createCollection();
    await insertData(new Date(), 42);
}

main();
