const mongoose = require('mongoose')

const VictimSchema = new mongoose.Schema({
    IP: {
        type: String
    },
    port: {
        type: Number
    },
    username: {
        type: String
    },
    password: {
        type: String
    }
})

const Victim = mongoose.model('victim',VictimSchema)

module.exports = {
    Victim
}