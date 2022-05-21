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
	var data = await getData("https://api.cosmetica.cc/get/cosmetic?type=hat&id="  + id + "&time=" + new Date().getTime());
	document.getElementById("watermark").style.display = "none";
	if (data.error) return document.getElementById("hider").style.display = "block";
	try {
		var hatModel = JSON.parse(data.model);
		var hatTexture = data.texture;
		var options = {
			canvas: document.getElementById("canvas"),
			width: 300,
			height: 300,
			hatModel: hatModel,
			hatTexture: hatTexture,
			renderPaused: true,
			fov: 45
		};
		screenshotter = initializeViewer(options, true);
		screenshotter.camera.rotation.x = 0;
		screenshotter.camera.rotation.y = 0.534;
		screenshotter.camera.rotation.z = 0;
		screenshotter.camera.position.x = 17;
		screenshotter.camera.position.y = 18;
		screenshotter.camera.position.z = 28.0;
		await Promise.all([
			screenshotter.loadSkin("/static/default3.png", "default")
		]);
		await Promise.all([
			screenshotter.loadHat(hatTexture)
		]);
		screenshotter.render();
	} catch {}

	setTimeout(function() {
		document.getElementById("hider").style.display = "block";
	}, 500);
}

doRender();