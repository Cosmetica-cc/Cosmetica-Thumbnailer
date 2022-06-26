function initializeViewer(options, transparent = false) {
	console.log("making transparent?", transparent);
	var skinViewer = transparent ? new skinview3d.SkinViewer(options) : new skinview3d.FXAASkinViewer(options);
	skinViewer.width = options.width;
	skinViewer.height = options.height;
	return skinViewer;
}

function generateImageFromSource(src) {
	return new Promise((resolve, reject) => {
	  	let img = new Image();
	  	img.onload = () => resolve(img);
	  	img.onerror = reject;
	  	img.src = src;
	});
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
	var data = await getData("https://api.cosmetica.cc/get/cosmetic?type=cape&id=" + id + "&time=" + new Date().getTime());
	document.getElementById("watermark").style.display = "none";
	if (data.error) return document.getElementById("hider").style.display = "block";
	try {
		document.getElementById("canvas2").style.left = "100px";
		var cape = data.image;
		var options = {
			canvas: document.getElementById("canvas"),
			renderPaused: true,
			width: 200,
			height: 300,
			fov: 40
		};
		var screenshotter = initializeViewer(options, true);
		options.fov = 50;
		options.canvas = document.getElementById("canvas2");
		var screenshotter2 = initializeViewer(options, true);

		screenshotter2.camera.rotation.x = 0;
		screenshotter2.camera.rotation.y = Math.PI + 0.534;
		screenshotter2.camera.rotation.z = 0;
		screenshotter2.camera.position.x = -20.5;
		screenshotter2.camera.position.y = -2.0;
		screenshotter2.camera.position.z = -42.0;

		screenshotter.camera.rotation.x = 0;
		screenshotter.camera.rotation.y = Math.PI - 0.534;
		screenshotter.camera.rotation.z = 0;
		screenshotter.camera.position.x = 18;
		screenshotter.camera.position.y = -0.5;
		screenshotter.camera.position.z = -42.0;
		var frame = await doCapeAnimation(false, cape, 0);
		await Promise.all([
			screenshotter.loadCape(frame, {backEquipment: "cape"}),
			screenshotter2.loadCape(frame, {backEquipment: "elytra"})
		]);
		screenshotter.render();
		screenshotter2.render();
	} catch {}
	setTimeout(function() {
		document.getElementById("hider").style.display = "block";
	}, 500);
}

doRender();