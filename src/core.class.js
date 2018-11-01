// IMPORT LIB
import 'babel-polyfill'
import amqp from 'amqplib'
import {
    Victim
} from '../model/victim'
import mongoose from 'mongoose'
class Core {
    constructor(url) {
        this.amqpURL = url
    }
    async get_catched_victim(q) {
        //CREATE CONNECTION AND CHANNEL
        this.con = await amqp.connect(this.amqpURL)
        this.channel = await this.con.createChannel()

        //JOIN TO QUERE Q => catched_victim
        this.channel.assertQueue(q, {
            durable: true
        })
        console.log("listen for catched_victim QUERE from worker")

        // LISTEN FOR MESSAGE SIGNAL FROM QUERE Q =? catched_victim
        this.channel.consume(q, async msg => {
            // HANDLE ARRIVED MESSAGE
            if (msg) {
                console.log("recieve sick victim from quere " + q)
                // CHANGE JSON TO OBJECT TYPE
                var victim = JSON.parse(msg.content.toString())
                console.log(victim)
                this.save_to_mongoose(victim)
            }
        }, {
            noAck: true
        })
    }

    async save_to_mongoose(vic) {
        mongoose.connect('mongodb://localhost:27017/SSH2_TEST', {
            useNewUrlParser: true
        }).catch(ERR => console.log(ERR))
        let victim = new Victim(vic)
        await victim.save()
        console.log("SAVE SUCCESS")
    }
}

//CREATE NEW INSTANCE
let core = new Core('amqp://localhost');
//RECIEVE CATCHED VICTIM FROM WORKER FROM QUERE cacthed_victim
core.get_catched_victim("catched_victim")