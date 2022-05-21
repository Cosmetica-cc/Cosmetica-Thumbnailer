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
	var data = await getData("https://api.cosmetica.cc/get/cosmetic?type=shoulderbuddy&id="  + id + "&time=" + new Date().getTime());
	document.getElementById("watermark").style.display = "none";
	if (data.error) return document.getElementById("hider").style.display = "block";
	try {
		document.getElementById("canvas2").style.left = "100px";
		var shoulderBuddyModel = JSON.parse(data.model);
		var shoulderBuddyTexture = data.texture;
		var options = {
			canvas: document.getElementById("canvas"),
			renderPaused: true,
			width: 300,
			height: 300,
			shoulderBuddyModel: shoulderBuddyModel,
			shoulderBuddyTexture: shoulderBuddyTexture,
			fov: 45
		};
		var screenshotter = initializeViewer(options, true);
		screenshotter.camera.rotation.x = 0;
		screenshotter.camera.rotation.y = 0.534;
		screenshotter.camera.rotation.z = 0;
		screenshotter.camera.position.x = 20;
		screenshotter.camera.position.y = 13;
		screenshotter.camera.position.z = 23.0;
		await Promise.all([
			screenshotter.loadSkin("/static/default3.png", "default")
		]);
		await Promise.all([
			screenshotter.loadShoulderBuddy(shoulderBuddyTexture)
		]);
		screenshotter.render();
	} catch {}

	setTimeout(function() {
		document.getElementById("hider").style.display = "block";
	}, 500);
}

doRender();