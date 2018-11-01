'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _amqplib = require('amqplib');

var _amqplib2 = _interopRequireDefault(_amqplib);

require('babel-polyfill');

var _tcpPortUsed = require('tcp-port-used');

var _tcpPortUsed2 = _interopRequireDefault(_tcpPortUsed);

var _ip = require('ip');

var _ip2 = _interopRequireDefault(_ip);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _position = require('../model/position');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Scanner = function (_event) {
  (0, _inherits3.default)(Scanner, _event);

  function Scanner(url) {
    (0, _classCallCheck3.default)(this, Scanner);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Scanner.__proto__ || Object.getPrototypeOf(Scanner)).call(this));

    _this.amqpURL = url;
    _this.con = null;
    _this.channel = null;
    _this.pos = 0;
    _this.interval = "";
    return _this;
  }

  //SAVE POSITION TO DATABASE


  (0, _createClass3.default)(Scanner, [{
    key: 'save_position_to_database',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var _this2 = this;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _mongoose2.default.connect('mongodb://localhost:27017/SSH2_TEST', { useNewUrlParser: true }).catch(function (ERR) {
                  return console.log(ERR);
                });
                _position.Position.findOne({ name: "Position" }).then(function () {
                  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(position) {
                    var pos;
                    return _regenerator2.default.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            if (!position) {
                              _context.next = 6;
                              break;
                            }

                            position.pos = _this2.pos;
                            _context.next = 4;
                            return position.save();

                          case 4:
                            _context.next = 9;
                            break;

                          case 6:
                            pos = new _position.Position({ name: "Position", pos: _this2.pos });
                            _context.next = 9;
                            return pos.save();

                          case 9:
                          case 'end':
                            return _context.stop();
                        }
                      }
                    }, _callee, _this2);
                  }));

                  return function (_x) {
                    return _ref2.apply(this, arguments);
                  };
                }());

              case 2:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function save_position_to_database() {
        return _ref.apply(this, arguments);
      }

      return save_position_to_database;
    }()

    //FUNCTION CONNECT TO AMQP SERVER

  }, {
    key: 'openConnection',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(q) {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return _amqplib2.default.connect(this.amqpURL);

              case 2:
                this.con = _context3.sent;
                _context3.next = 5;
                return this.con.createChannel();

              case 5:
                this.channel = _context3.sent;

                this.channel.assertQueue(q, { durable: true });

              case 7:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function openConnection(_x2) {
        return _ref3.apply(this, arguments);
      }

      return openConnection;
    }()

    //EMIT EVENT FUNCTION

  }, {
    key: 'emitEvent',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        var _this3 = this;

        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                //emit start event
                this.interval = setInterval(function () {
                  _this3.emit("start");
                }, 100);

                //emit save event
                if (this.pos > 0 && this.pos % 10000 === 0) {
                  this.emit("save");
                }

              case 2:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function emitEvent() {
        return _ref4.apply(this, arguments);
      }

      return emitEvent;
    }()

    //LISTEN FOR EVENT EMITTED

  }, {
    key: 'listen_for_event',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var _this4 = this;

        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                this.on("start", function () {
                  _this4.scan_port('victim');
                  _this4.pos++;
                });
                this.on("save", function () {
                  _this4.save_position_to_database();
                });

              case 2:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function listen_for_event() {
        return _ref5.apply(this, arguments);
      }

      return listen_for_event;
    }()
  }, {
    key: 'turn_off_scanner',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(minute, number_in_quere, q) {
        var num;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                num = this.channel.checkQueue();

                console.log(num);

              case 2:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function turn_off_scanner(_x3, _x4, _x5) {
        return _ref6.apply(this, arguments);
      }

      return turn_off_scanner;
    }()

    //FUNCTION SCAN PORT 

  }, {
    key: 'scan_port',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(q) {
        var _this5 = this;

        var check;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return _tcpPortUsed2.default.check(22, _ip2.default.fromLong(this.pos)).catch(function (e) {
                  if (e.errno.toString() === "ENETUNREACH") {
                    console.log("IP " + _ip2.default.fromLong(_this5.pos) + " NOT TURN ON COMPUTER!");
                  }
                });

              case 2:
                check = _context7.sent;

                if (check == true) {
                  console.log("IP" + _ip2.default.fromLong(this.pos) + "open port 22");
                  console.log("SEND TO WORKER EXCHANGE");
                  this.channel.sendToQueue(q, Buffer.from(_ip2.default.fromLong(this.pos)), { persistent: true });
                } else if (check == false) {
                  console.log("IP " + _ip2.default.fromLong(this.pos) + " not port 22");
                }

              case 4:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function scan_port(_x6) {
        return _ref7.apply(this, arguments);
      }

      return scan_port;
    }()
  }]);
  return Scanner;
}(_eventemitter2.default); // IMPORT LIB


var scanner = new Scanner('amqp://localhost');
scanner.openConnection('victim');
scanner.emitEvent();
scanner.listen_for_event();
if (scanner.channel != null) {
  scanner.turn_off_scanner(10, 10, 'victim');
}