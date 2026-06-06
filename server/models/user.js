const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Employee'
    },
    uniquestring: {
        type: String,
        required: true
    },
    createdat: {
        type: Date,
        default: Date.now
    },
    expireat: {
        type: Date,
        required: true
    }
})

const usermodel = mongoose.model("usermodel", userSchema)
module.exports = usermodel

