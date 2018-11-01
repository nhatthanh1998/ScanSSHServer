'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

require('babel-polyfill');

var _amqplib = require('amqplib');

var _amqplib2 = _interopRequireDefault(_amqplib);

var _victim = require('../model/victim');

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// IMPORT LIB
var Core = function () {
    function Core(url) {
        (0, _classCallCheck3.default)(this, Core);

        this.amqpURL = url;
    }

    (0, _createClass3.default)(Core, [{
        key: 'get_catched_victim',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(q) {
                var _this = this;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return _amqplib2.default.connect(this.amqpURL);

                            case 2:
                                this.con = _context2.sent;
                                _context2.next = 5;
                                return this.con.createChannel();

                            case 5:
                                this.channel = _context2.sent;


                                //JOIN TO QUERE Q => catched_victim
                                this.channel.assertQueue(q, {
                                    durable: true
                                });
                                console.log("listen for catched_victim QUERE from worker");

                                // LISTEN FOR MESSAGE SIGNAL FROM QUERE Q =? catched_victim
                                this.channel.consume(q, function () {
                                    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(msg) {
                                        var victim;
                                        return _regenerator2.default.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        // HANDLE ARRIVED MESSAGE
                                                        if (msg) {
                                                            console.log("recieve sick victim from quere " + q);
                                                            // CHANGE JSON TO OBJECT TYPE
                                                            victim = JSON.parse(msg.content.toString());

                                                            console.log(victim);
                                                            _this.save_to_mongoose(victim);
                                                        }

                                                    case 1:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this);
                                    }));

                                    return function (_x2) {
                                        return _ref2.apply(this, arguments);
                                    };
                                }(), {
                                    noAck: true
                                });

                            case 9:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function get_catched_victim(_x) {
                return _ref.apply(this, arguments);
            }

            return get_catched_victim;
        }()
    }, {
        key: 'save_to_mongoose',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(vic) {
                var victim;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _mongoose2.default.connect('mongodb://localhost:27017/SSH2_TEST', {
                                    useNewUrlParser: true
                                }).catch(function (ERR) {
                                    return console.log(ERR);
                                });
                                victim = new _victim.Victim(vic);
                                _context3.next = 4;
                                return victim.save();

                            case 4:
                                console.log("SAVE SUCCESS");

                            case 5:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function save_to_mongoose(_x3) {
                return _ref3.apply(this, arguments);
            }

            return save_to_mongoose;
        }()
    }]);
    return Core;
}();

//CREATE NEW INSTANCE


var core = new Core('amqp://localhost');
//RECIEVE CATCHED VICTIM FROM WORKER FROM QUERE cacthed_victim
core.get_catched_victim("catched_victim");