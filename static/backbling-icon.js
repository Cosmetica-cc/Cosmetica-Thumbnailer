function initializeViewer(options, transparent = false) {
    if (!options.customModels) options.customModels = [];
    if (options.backBlingModel && options.backBlingTexture) {
		console.log("back bling detected!");
		options.customModels.push({
			name: "backbling",
			x: 8,
			y: 0,
			z: 6,
			rotationAxis: "y",
			rotation: 0,
			attachTo: "body",
			texture: options.backBlingTexture,
			json: options.backBlingModel
		});
		delete options.backBlingModel;
		delete options.backBlingTexture;
	}

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
	var data = await getData("https://api.cosmetica.cc/get/cosmetic?type=backbling&id="  + id + "&time=" + new Date().getTime());
	document.getElementById("watermark").style.display = "none";
	if (data.error) return document.getElementById("hider").style.display = "block";
	try {
		var hatModel = JSON.parse(data.model);
		var hatTexture = data.texture;
		var options = {
			canvas: document.getElementById("canvas"),
			width: 300,
			height: 300,
			backBlingModel: hatModel,
			backBlingTexture: hatTexture,
			renderPaused: true,
			fov: 45
		};
		screenshotter = initializeViewer(options, true);

        screenshotter.camera.rotation.x = 0;
		screenshotter.camera.rotation.y = Math.PI - 0.334;
		screenshotter.camera.rotation.z = 0;
		screenshotter.camera.position.x = 11;
		screenshotter.camera.position.y = 0;
		screenshotter.camera.position.z = -35.0;
		await Promise.all([
			screenshotter.loadSkin("/static/default3.png", "default")
		]);
		await Promise.all([
			screenshotter.loadCape("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAfSURBVGhD7cEBDQAAAMKg909tDwcEAAAAAAAAAJyrASAgAAHPEVscAAAAAElFTkSuQmCC")
		]);
		screenshotter.render();
	} catch {}

	setTimeout(function() {
		document.getElementById("hider").style.display = "block";
	}, 500);
}

doRender();