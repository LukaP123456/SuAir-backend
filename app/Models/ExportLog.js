const mongoose = require('mongoose');

const ExportLogSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    export_time: Date,
    export_time_range: Date,
    measuring_device: String,
}, {collection: 'export-data-log'});

module.exports = mongoose.model('ExportLog', ExportLogSchema)
