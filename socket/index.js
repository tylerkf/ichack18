var socketio = require('socket.io');
var eventEmitter = require('../eventEmitter');

var io;

module.exports.setServer = function(server, sessionMiddleware) {
	io = socketio(server);

	io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
	});

	io.on("connection", function(socket) {
		console.log("user connected");
		console.log(socket.request.session.id);
	});

	eventEmitter.on("newAudio", function(audio) {
		console.log("emit recieved");
		io.sockets.emit("newAudio", audio);
	});

	eventEmitter.on("ready", function(audio) {
		console.log("emit recieved");
		io.sockets.emit("ready");
	});
};