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
	var data = await getData("https://api.cosmetica.cc/get/cosmetic?type=hat&id="  + id);
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
	if (cape) await Promise.all([
		screenshotter.loadCape(cape, {backEquipment: "elytra"}),
		screenshotter2.loadCape(cape, {backEquipment: "cape"})
	]);
	screenshotter.render();
	screenshotter2.render();

	setTimeout(function() {
		document.getElementById("hider").style.display = "block";
	}, 500);
}

console.log("here");

doRender();