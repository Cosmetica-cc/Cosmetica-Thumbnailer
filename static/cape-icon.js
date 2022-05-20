function initializeViewer(options, transparent = false) {
	console.log("making transparent?", transparent);
	var skinViewer = transparent ? new skinview3d.SkinViewer(options) : new skinview3d.FXAASkinViewer(options);
	skinViewer.width = options.width;
	skinViewer.height = options.height;
	return skinViewer;
}

function getData(url) { 
	return $.ajax({
	  	url: url,
	  	type: 'GET',
	});
};

async function doRender() {
	var data = await getData("https://api.cosmetica.cc/get/cosmetic?type=cape&id="  + id);
	document.getElementById("watermark").style.display = "none";
	if (data.error) return document.getElementById("hider").style.display = "block";
	document.getElementById("canvas2").style.left = "100px";
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
		width: 300,
		height: 300,
		hatModel: hatModel,
		hatTexture: hatTexture,
		shoulderBuddyModel: shoulderBuddyModel,
		shoulderBuddyTexture: shoulderBuddyTexture,
		fov: 40
	};
	var screenshotter;
	var screenshotter2;
	if (data.type == "Hat") {
		options.fov = 35;
		screenshotter = initializeViewer(options, true);
		screenshotter.camera.rotation.x = 0;
		screenshotter.camera.rotation.y = 0.534;
		screenshotter.camera.rotation.z = 0;
		screenshotter.camera.position.x = 25;
		screenshotter.camera.position.y = 20.0;
		screenshotter.camera.position.z = 42.0;
	} else if (data.type == "Shoulder Buddy") {
		options.fov = 45;
		screenshotter = initializeViewer(options, true);
		screenshotter.camera.rotation.x = 0;
		screenshotter.camera.rotation.y = 0.534;
		screenshotter.camera.rotation.z = 0;
		screenshotter.camera.position.x = 20;
		screenshotter.camera.position.y = 13;
		screenshotter.camera.position.z = 23.0;
	} else if (data.type == "Cape") {
		options.fov = 40;
		options.width = 200;
		screenshotter = initializeViewer(options, true);
		options.fov = 50;
		options.canvas = document.getElementById("canvas2");
		screenshotter2 = initializeViewer(options, true);

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
	}
	if (hatTexture) await Promise.all([
		screenshotter.loadHat(hatTexture)
	]);
	if (shoulderBuddyTexture) await Promise.all([
		screenshotter.loadShoulderBuddy(shoulderBuddyTexture)
	]);
	if (data.type == "Cape") {
		await Promise.all([
			screenshotter.loadCape(cape, {backEquipment: "cape"}),
			screenshotter2.loadCape(cape, {backEquipment: "elytra"})
		]);
	}
	screenshotter.render();
	
	if (data.type == "Cape") screenshotter2.render();

	console.log("done");

	setTimeout(function() {
		document.getElementById("hider").style.display = "block";
	}, 500);
}

console.log("here");

doRender();