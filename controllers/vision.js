var spawn = require("child_process").spawn;

module.exports.runVision = function(image, callback) {
	var process = spawn('python3',["./controllers/vision.py", image]);

	process.stdout.on('data', function (data){
		console.log("___");
		process.kill("SIGINT");

		try {
			var dataString = data.toString();
			var results = JSON.parse(dataString);
			console.log(results);
			callback(results.tags, image);
		} catch(e) {
			console.log(data.toString());
			console.log(e);
		}

	});
};
