var express = require('express');
var router = express.Router();
var scrape = require('../controllers/scrape');
var formidable = require('formidable');
var socketConfig = require('../socket');
var visionController = require('../controllers/vision');
var eventEmitter = require('../eventEmitter');

var urls = [];
const URI = "http://earmersion.duckdns.org";

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { audioUrls: urls });
});

router.get("/form", function(req, res, next) {
	res.render("form");
});

router.get("/simple", function(req, res, next) {
        res.render("simple");
});

router.post("/submit", function(req, res, next) {
	console.log(req.body);
	var form = new formidable.IncomingForm();
	form.parse(req);

	var fileNum = 0;

	form.on("fileBegin", function(name, file) {
		//file.path = __dirname + "/../public/uploads/" + file.name;
		var split = file.name.split(".");
		file.name = req.session.id + "-"  + fileNum.toString() + "." + split[split.length - 1];
		fileNum++;
		file.path = __dirname + "/../public/uploads/" + file.name;
	});

	form.on("file", function(name, file) {
		console.log("Uploaded " + file.name);
		var split = file.name.split(".");
		var image = URI + "/uploads/" + file.name;
		visionController.runVision(image, visionCallback);
		console.log(image);
	});


	res.redirect("/view");
});

router.get("/view", function(req, res, next) {
	console.log(req.params.sessionId);
  res.render("view", {
  	audioUrls: [],
  	photos: [req.session.id]
  });
});

function visionCallback(tags, image) {
	console.log("vision callback");
	var totalUrls = 0;
	tags.forEach(function(tag) {
		var searchUrl = 'https://freesound.org/search/?g=1&q=' + tag.name + '&f=tag:"ambience"';
		scrape.getSoundUrls(searchUrl, function(url) {
			totalUrls++;
			if (url == "err") return;
			console.log(url);
			var audio = {
				url,
				name: tag.name,
				confidence: tag.confidence,
				image
			}
			eventEmitter.emit("newAudio", audio);
			if (totalUrls  >= tags.length) {
				eventEmitter.emit("ready");
			}
		});
	});
}

module.exports = router;
