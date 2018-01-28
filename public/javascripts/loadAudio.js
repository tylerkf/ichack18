const FADE_DURATION = 5000;
const IMAGE_DURATION = 10000;
const MAX_AUDIO_ELEMENTS = 8;

var socket = io();
var audioByImage = {};
var images = [];
var started = false;

var photoLoaded = false;

socket.on("connection", function() {
	console.log("connected to server");
});

socket.on("newAudio", function(audio) {
	console.log(audio);
	var a = new Audio(audio.url);
	a.volume = 0;
	a.loop = true;
	if (audioByImage[audio.image] == undefined) {
		audioByImage[audio.image] = [a];
		images.push(audio.image);
		addImage(images.length - 1);
	} else {
		audioByImage[audio.image].push(a);
	}
});

socket.on("ready", function() {
	console.log("ready");
	beginAudio();
});


function beginAudio() {
	if (started) return;
	started = true;
	$("#buffer").remove();
	if (photoLoaded) {
		console.log("starting image");
		showNextImage(0);
	}
}

function addImage(i) {
	var image = images[i];
        var imgElement = document.createElement("img");
        imgElement.id = "images" + i.toString();
        imgElement.src = image;
	//imgElement.className = "centre";
        imgElement.style = "display: none; position: absolute";
	if (i == 0) {
		imgElement.onload = function() {
			if (started) {
				showNextImage(0);
			}
		};
	}
        var imagesDiv = document.getElementById("images");
        imagesDiv.appendChild(imgElement);
}

function showNextImage(i) {
	$("#images" + i.toString()).fadeIn(FADE_DURATION);

	if (audioByImage[images[i]].length > MAX_AUDIO_ELEMENTS) {
		console.log("truncating");
		function compare(a, b) {
			if (a.confidence > b.confidence) {
				return 1;
			} else if (a.confidence < b.confidence) {
				return -1;
			} else {
				return 0;
			}
		}

		audioByImage[images[i]] = audioByImage[images[i]].sort(compare).splice(audioByImage[images[i]].length - MAX_AUDIO_ELEMENTS);
	}

	console.log(audioByImage[images[i]]);

	audioFadeIn(i);

	setTimeout(function() {

		if (i >= images.length - 1) {
			console.log("end of images");
			if (i > 0) {
				$("#images" + i.toString()).fadeOut(FADE_DURATION);
				audioFadeOut(i);
				setTimeout(function() { window.history.go(-1); }, FADE_DURATION);
			}
			return;
		}
		$("#images" + i.toString()).fadeOut(FADE_DURATION);
		audioFadeOut(i);
		i++;
		showNextImage(i);
	}, IMAGE_DURATION);
}

function audioFadeIn(i) {
	var volume = 0;

	audioByImage[images[i]].forEach(function(audio) {
                audio.play();
        });

	var intervalId = setInterval(function() {
		if (volume > 1) {
			clearInterval(intervalId);
			return;
		}
		audioByImage[images[i]].forEach(function(audio) {
			audio.volume = volume;
        	});
		volume += 0.01;
	}, Math.ceil(FADE_DURATION / 100));
}

function audioFadeOut(i) {
        var volume = 1;

        var intervalId = setInterval(function() {
                if (volume < 0) {
                        clearInterval(intervalId);
                        return;
                } else if (volume == 0) {
			audioByImage[images[i]].forEach(function(audio) {
           	     		audio.pause();
        		});
		} else {
                	audioByImage[images[i]].forEach(function(audio) {
                        	audio.volume = volume;
                	});
		}
                volume -= 0.01;
        }, Math.ceil(FADE_DURATION / 100));
}
