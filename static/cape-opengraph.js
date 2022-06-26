function initializeViewer(options, transparent = false) {
	console.log("making transparent?", transparent);
	var skinViewer = transparent ? new skinview3d.SkinViewer(options) : new skinview3d.FXAASkinViewer(options);
	skinViewer.width = options.width;
	skinViewer.height = options.height;
	return skinViewer;
}

async function doCapeAnimation(viewer, cape, speed, typeCallback = function() {return "cape"}) {
	if (!cape) return false;
	
	var img = await generateImageFromSource(cape);
	console.log("cape image loaded!");
	var width = img.width;
	var height = img.width / 2;
	var frameCount = img.height / height;

	var frames = [];

	var canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	var ctx = canvas.getContext("2d");

	function getSpeed() {
		if (typeof speed === "function") {
			return speed();
		}
		return speed;
	}

	for (let i = 0; (i < frameCount && getSpeed()) || !i; i++) {
		console.log("doing frame " + i);
		ctx.drawImage(img, 0, height * i, width, height, 0, 0, width, height);
		frames.push(canvas.toDataURL());
	}

	if (frames.length == 1) { // static cape
		if (viewer) viewer.loadCape(frames[0], {backEquipment: typeCallback()});
	} else { // animated cape
		if (viewer) viewer.loadCape(frames[0], {backEquipment: typeCallback()});
		i = 0;
		function doLoop() {
			i++;
			if (i >= frameCount) i = 0;
			if (!viewer || !viewer.canvas) {
				console.log("stopping animation!");
			} else {
				viewer.loadCape(frames[i], {backEquipment: typeCallback()});
				setTimeout(function() {
					doLoop();
				}, getSpeed());
			}
		}
		doLoop();
	}
	return frames[0];
}

function getData(url) { 
	return $.ajax({
	  	url: url,
	  	type: 'GET',
	});
};

async function doRender() {
	var data = await getData("https://api.cosmetica.cc/get/cosmetic?type=cape&id="  + id);
	console.log(data);
	var hatModel = false;
	var hatTexture = false;
	var shoulderBuddyModel = false;
	var shoulderBuddyTexture = false;
	var cape = false;
	if (data.type == "Cape") {
		cape = data.image
	}
	if (data.type == "Hat") {
		hatModel = JSON.parse(data.model);
		hatTexture = data.texture;
	}
	if (data.type == "Shoulder Buddy") {
		shoulderBuddyModel = JSON.parse(data.model);
		shoulderBuddyTexture = data.texture;
	}
	var options = {
		canvas: document.getElementById("canvas"),
		renderPaused: true,
		width: 1200,
		height: 630,
		hatModel: hatModel,
		hatTexture: hatTexture,
		shoulderBuddyModel: shoulderBuddyModel,
		shoulderBuddyTexture: shoulderBuddyTexture,
		fov: 40
	};
	var screenshotter = initializeViewer(options, true);
	options.canvas = document.getElementById("canvas2");
	var screenshotter2 = initializeViewer(options, true);
	if (data.type == "Hat") {
		screenshotter.camera.rotation.x = 0;
		screenshotter.camera.rotation.y = 0.534;
		screenshotter.camera.rotation.z = 0;
		screenshotter.camera.position.x = 8;
		screenshotter.camera.position.y = 14;
		screenshotter.camera.position.z = 42.0;

		screenshotter2.camera.rotation.x = 0;
		screenshotter2.camera.rotation.y = Math.PI - 0.534;
		screenshotter2.camera.rotation.z = 0;
		screenshotter2.camera.position.x = 8;
		screenshotter2.camera.position.y = 14;
		screenshotter2.camera.position.z = -42.0;
	} else if (data.type == "Shoulder Buddy") {
		screenshotter.camera.rotation.x = 0;
		screenshotter.camera.rotation.y = 0.534;
		screenshotter.camera.rotation.z = 0;
		screenshotter.camera.position.x = 30;
		screenshotter.camera.position.y = 10;
		screenshotter.camera.position.z = 23.0;

		screenshotter2.camera.rotation.x = 0;
		screenshotter2.camera.rotation.y = Math.PI - 0.534;
		screenshotter2.camera.rotation.z = 0;
		screenshotter2.camera.position.x = 30;
		screenshotter2.camera.position.y = 10;
		screenshotter2.camera.position.z = -23.0;
	} else if (data.type == "Cape") {
		screenshotter.camera.rotation.x = 0;
		screenshotter.camera.rotation.y = Math.PI + 0.534;
		screenshotter.camera.rotation.z = 0;
		screenshotter.camera.position.x = -8;
		screenshotter.camera.position.y = -2;
		screenshotter.camera.position.z = -42.0;

		screenshotter2.camera.rotation.x = 0;
		screenshotter2.camera.rotation.y = Math.PI - 0.534;
		screenshotter2.camera.rotation.z = 0;
		screenshotter2.camera.position.x = 8;
		screenshotter2.camera.position.y = -2;
		screenshotter2.camera.position.z = -42.0;
	}


	await Promise.all([
		screenshotter.loadSkin("/static/default5.png", "default"),
		screenshotter2.loadSkin("/static/default5.png", "default")
	]);
	await Promise.all([
		screenshotter.loadPanorama("https://cosmetica.cc/page/panoramas/get?trash&id=1")
	]);
	if (hatTexture) await Promise.all([
		screenshotter.loadHat(hatTexture),
		screenshotter2.loadHat(hatTexture)
	]);
	if (shoulderBuddyTexture) await Promise.all([
		screenshotter.loadShoulderBuddy(shoulderBuddyTexture),
		screenshotter2.loadShoulderBuddy(shoulderBuddyTexture)
	]);
	var frame = await doCapeAnimation(false, cape, 0);
	if (cape) await Promise.all([
		screenshotter.loadCape(frame, {backEquipment: "elytra"}),
		screenshotter2.loadCape(frame, {backEquipment: "cape"})
	]);
	screenshotter.render();
	screenshotter2.render();

	setTimeout(function() {
		document.getElementById("hider").style.display = "block";
	}, 500);
}

console.log("here");

doRender();