function initializeViewer(options, zoom = false) {
	var skinViewer = new skinview3d.FXAASkinViewer(options);
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
	if (data.role && data.role != "none") {
		//var badge = await getData("/access-control/https://cosmetica.cc/page/badges/" + data.role + ".png");
		document.getElementById("watermark").innerHTML = "<img id=\"badge\" /><span>Cosmetica</span>";
		document.getElementById("badge").src = "/access-control/https://cosmetica.cc/page/badges/" + data.role + ".png";
	}
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
		background: "#000",
		width: 1200,
		height: 630,
		hatModel: hatModel,
		hatTexture: hatTexture,
		shoulderBuddyModel: shoulderBuddyModel,
		shoulderBuddyTexture: shoulderBuddyTexture,
		fov: 30
	};
	var screenshotter = initializeViewer(options);
	screenshotter.camera.rotation.x = 0;
	screenshotter.camera.rotation.y = 0.534;
	screenshotter.camera.rotation.z = 0;
	screenshotter.camera.position.x = 25;
	screenshotter.camera.position.y = 12.0;
	screenshotter.camera.position.z = 42.0;
	await Promise.all([
		screenshotter.loadSkin((data.skin != "" ? data.skin : "default.png"), data.slim ? "slim" : "default")
	]);
	await Promise.all([
		screenshotter.loadPanorama("https://cosmetica.cc/page/panoramas/get?id=" + data.panorama)
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