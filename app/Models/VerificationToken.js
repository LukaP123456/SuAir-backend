const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const verificationTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
}, {collection: 'verification-tokens'});

const VerificationToken = mongoose.model("VerificationToken", verificationTokenSchema);

module.exports = VerificationToken;
