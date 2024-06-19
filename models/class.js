const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const classSchema = new Schema({
    number: {
        type: Number,
        required: true
    },
    createdAt : {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Class", classSchema);
