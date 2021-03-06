function initializeViewer(options, transparent = false) {
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
	var data = await getData("https://api.cosmetica.cc/get/info?user="  + id);
	document.getElementById("watermark").style.display = "none";
	var hatModel = false;
	var hatTexture = false;
	var shoulderBuddyModel = false;
	var shoulderBuddyTexture = false;
	if (data.hat && !data.hat.id.startsWith("-")) {
		hatModel = JSON.parse(data.hat.model);
		hatTexture = data.hat.texture;
	}
	if (data.shoulderBuddy && !data.shoulderBuddy.id.startsWith("-")) {
		shoulderBuddyModel = JSON.parse(data.shoulderBuddy.model);
		shoulderBuddyTexture = data.shoulderBuddy.texture;
	}
	var options = {
		canvas: document.getElementById("canvas"),
		renderPaused: true,
		width: 800,
		height: 1400,
		hatModel: hatModel,
		hatTexture: hatTexture,
		shoulderBuddyModel: shoulderBuddyModel,
		shoulderBuddyTexture: shoulderBuddyTexture,
		fov: 45,
	};
	var screenshotter = initializeViewer(options, true);
	screenshotter.camera.rotation.x = 0;
	screenshotter.camera.rotation.y = -Math.PI / 4;
	screenshotter.camera.rotation.z = 0;
	screenshotter.camera.position.x = -51;
	screenshotter.camera.position.y = 10.0;
	screenshotter.camera.position.z = 50.0;
	await Promise.all([
		screenshotter.loadSkin((data.skin != "" ? data.skin : "default.png"), data.slim ? "slim" : "default")
	]);
	if (hatTexture) await Promise.all([
		screenshotter.loadHat(hatTexture)
	]);
	if (shoulderBuddyTexture) await Promise.all([
		screenshotter.loadShoulderBuddy(shoulderBuddyTexture)
	]);
	if (data.cape) {
		await Promise.all([
			screenshotter.loadCape(data.cape ? data.cape.image : false, {backEquipment: "elytra"})
		]);
	}

	screenshotter.render();
	setTimeout(function() {
		document.getElementById("hider").style.display = "block";
	}, 500);
}

console.log("here");

doRender();