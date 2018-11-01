const mongoose = require('mongoose')

const PositionSchema = new mongoose.Schema({
    pos:{
        type:Number
    },
    name:{
        type:String
    }
})

const Position = mongoose.model('position',PositionSchema)

module.exports = {
    Position
}