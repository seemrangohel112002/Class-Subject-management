
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const divisionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    classId: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    }
});


module.exports = mongoose.model('Division', divisionSchema);
