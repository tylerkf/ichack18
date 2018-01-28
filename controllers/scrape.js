var request = require('request');
var cheerio = require('cheerio');

module.exports.getSoundUrls = function(url, callback) {
	request(url, function(err, res, html) {
		console.log("got html");
		if (err) {
			console.log(err);
			callback("err");
			return;
		}

		var $ = cheerio.load(html);

		/*$('.ui360').each(function(i, element) {
			var url = $(this).children().last().attr('href');
			//callback(url);
		});*/

		var url = $('.mp3_file').first().attr('href');
		if (url == undefined) {
			callback("err");
		} else {
			callback("https://freesound.org" + url);
		}
	});
}
