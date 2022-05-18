import captureWebsite from "capture-website";
import express from "express";
import fs from "fs";
import request from "request";
import path from "path";
import {createRequire} from "module";
const require = createRequire(import.meta.url);
const config = require("./config.json");
const privateServer = express();

function dir() {
	return path.resolve(path.dirname(""));
}

const template = fs.readFileSync(dir() + "/template.html", "utf8");

var uuidCache = new Object;

const imageTypes = {
	player: {
		opengraph: {
			imageType: "jpeg",
			width: 1200,
			height: 630,
			quality: 0.7
		}
	}
};

const imageEndings = ["png", "jpg", "jpeg"]

async function getUuidFromUsername(username) {
	if (!config.enableCaching) return username;
	username = username.toLowerCase();
	if (Object.keys(uuidCache).includes(username)) return uuidCache[username].uuid;
	try {
		var data = await doRequest("http://api.cosmetica.cc/get/userdata?user=" + username);
		data = JSON.parse(data);
		if (data.uuid) {
			uuidCache[username] = new Object({
				uuid: data.uuid,
				timeout: setTimeout(function() {
					delete uuidCache[username];
				}, config.uuidCachePeriod * 60 * 1000)
			});
			return data.uuid;
		} else {
			uuidCache[username] = new Object({
				uuid: false,
				timeout: setTimeout(function() {
					delete uuidCache[username];
				}, config.uuidCachePeriod * 60 * 1000)
			});
			return false;
		}
	} catch (e) {
		console.log(e);
		uuidCache[username] = new Object({
			uuid: false,
			timeout: setTimeout(function() {
				delete uuidCache[username];
			}, config.uuidFailCachePeriod * 60 * 1000)
		});
		return false;
	}
}

function doRequest(url) {
	return new Promise(function (resolve, reject) {
	  	request(url, function (error, res, body) {
			if (!error && res.statusCode == 200) {
		  		resolve(body);
			} else {
		  		reject(error);
			}
	  	});
	});
}

privateServer.use("/static", express.static("static"));

privateServer.use("/access-control/*", async function(req, res) {
	try {
		request(req.params[0]).pipe(res);
	} catch (e) {
		res.status(404).send("Invalid url");
	}
});

privateServer.get("/:subject/:imageType/:user", async function (req, res) {
	var subject = req.params.subject;
	var id = req.params.user;
	var imageType = req.params.imageType;
	if (!Object.keys(imageTypes).includes(subject) || !Object.keys(imageTypes[subject]).includes(imageType)) {
		res.status(404).send("Invalid image type");
		return;
	}
	var html = template;
	html = html.split("IMAGE_TYPE").join(imageType);
	html = html.split("IMAGE_SUBJECT").join(subject);
	html = html.split("IMAGE_ID").join(id);
	res.send(html);
});


const app = express();

app.get("/:subject/:imageType/:user", async function (req, res) {
	var subject = req.params.subject;
	var id = req.params.user.toLowerCase();
	var imageType = req.params.imageType;
	if (!Object.keys(imageTypes).includes(subject) || !Object.keys(imageTypes[subject]).includes(imageType)) {
		res.status(404).send("Invalid image type");
		return;
	}
	for (let i = 0; i < imageEndings.length; i++) {
		if (id.endsWith("." + imageEndings[i])) {
			id = id.substring(0, id.length - imageEndings[i].length - 1);
			break;
		}
	}
	if (subject == "player") {
		id = await getUuidFromUsername(id);
		if (!id) {
			res.status(404).send("Invalid username or UUID");
			return;
		}
	}
	var fileType = imageTypes[subject][imageType].imageType;
	if (config.enableCaching) {
		var fileName = dir() + "/images/" + subject + "-" + imageType + "-" + id + "." + fileType;
		try {
			var stats = fs.statSync(fileName);
			if (new Date().getTime() - stats.mtime < 1440 * 60 * 1000) {
				res.sendFile(fileName);
				return;
			}
		} catch {}
		var didScreenshot = await screenshot(subject, id, imageType, fileType);
		if (didScreenshot)  {
			res.sendFile(fileName);
			return;
		}
	} else {
		var didScreenshot = await screenshot(subject, id, imageType, fileType);
		if (didScreenshot && didScreenshot.length) {
			res.writeHead(200, {
				'Content-Type': 'image/png',
				'Content-Length': didScreenshot.length
			});
			res.end(didScreenshot);
			return;
		}
	}
	res.status(404).end();
});

app.get('/', function (req, res) {
	res.send("Hello World");
});

app.listen(config.port, function() {
	console.log("Started server on port " + config.port);
});
privateServer.listen(config.internalPort);

async function screenshot(subject, id, imageType, fileType) {
	var properties = imageTypes[subject][imageType];
	var options = {
		waitForElement: "#hider",
		width: properties.width,
		height: properties.height,
		type: properties.imageType,
		scaleFactor: 1
	};
	if (options.type == "jpeg") options.quality = properties.quality;
	try {
		if (config.enableCaching) {
			var fileName = dir() + "/images/" + subject + "-" + imageType + "-" + id + "." + properties.imageType;
			try {
				fs.unlinkSync(fileName);
			} catch {}
			await captureWebsite.file("http://127.0.0.1:" + config.internalPort + "/" + subject + "/" + imageType + "/" + id, fileName, options);
			return true;
		} else {
			var shot = await captureWebsite.buffer("http://127.0.0.1:" + config.internalPort + "/" + subject + "/" + imageType + "/" + id, options);
			return shot;
		}
	} catch (e) {
		console.log(e);
		return false;
	}
}