var EventEmitter = require('events');

class MainEventEmitter extends EventEmitter {}

var mainEventEmitter = module.exports = new MainEventEmitter();