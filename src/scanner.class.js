// IMPORT LIB
import amqp from 'amqplib'
import 'babel-polyfill'
import tcp from 'tcp-port-used'
import ip from 'ip'
import mongoose from 'mongoose'
import event from 'eventemitter3'
import {Position} from '../model/position'
class Scanner extends event {
  constructor(url) {
    super()
    this.amqpURL = url
    this.con = null;
    this.channel = null;
    this.pos = 0;
    this.interval = "";
  }

  //SAVE POSITION TO DATABASE
  async save_position_to_database() {
    mongoose
      .connect('mongodb://localhost:27017/SSH2_TEST', {useNewUrlParser: true})
      .catch(ERR => console.log(ERR));
    Position
      .findOne({name: "Position"})
      .then(async position => {
        if (position) {
          position.pos = this.pos
          await position.save()
        } else {
          var pos = new Position({name: "Position", pos: this.pos})
          await pos.save()
        }
      })
  }

  //FUNCTION CONNECT TO AMQP SERVER
  async openConnection(q) {
    this.con = await amqp.connect(this.amqpURL)
    this.channel = await this
      .con
      .createChannel()
    this
      .channel
      .assertQueue(q, {durable: true})
  }

  //EMIT EVENT FUNCTION
  async emitEvent() {
    //emit start event
    this.interval = setInterval(() => {
      this.emit("start");
    }, 100)

    //emit save event
    if (this.pos > 0 && this.pos % 10000 === 0) {
      this.emit("save")
    }
  }

  //LISTEN FOR EVENT EMITTED
  async listen_for_event() {
    this.on("start", () => {
      this.scan_port('victim')
      this.pos++;
    })
    this.on("save", () => {
      this.save_position_to_database()
    })
  }

  //FUNCTION SCAN PORT
  async scan_port(q) {
    // check port
    var check = await tcp
      .check(22, ip.fromLong(this.pos))
      .catch(e => {
        if (e.errno.toString() === "ENETUNREACH") {
          console.log("IP " + ip.fromLong(this.pos) + " NOT TURN ON COMPUTER!")
        }
      });
      // IF PORT 22 OPEN SEND TO THE QUERE
      if (check == true) {
        console.log("IP" + ip.fromLong(this.pos) + "open port 22")
        console.log("SEND TO WORKER EXCHANGE")
        this
          .channel
          .sendToQueue(q, Buffer.from(ip.fromLong(this.pos)), {persistent: true})
      } 
      // NOT OPEN PORT 22 => LOG TO CONSOLE
      else if (check == false) {
        console.log("IP " + ip.fromLong(this.pos) + " not port 22")
      }
  }
}
var scanner = new Scanner('amqp://localhost');
scanner.openConnection('victim')
scanner.emitEvent()
scanner.listen_for_event()