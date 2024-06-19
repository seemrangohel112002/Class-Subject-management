const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const teacherSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    classId: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    divisionId: {
        type: Schema.Types.ObjectId,
        ref: 'Division',
        required: true
    }
});

module.exports = mongoose.model("Teacher", teacherSchema);
