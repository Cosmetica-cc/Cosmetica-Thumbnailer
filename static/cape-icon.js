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
			cape: data.image,
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
		await Promise.all([
			screenshotter.loadCape(cape, {backEquipment: "cape"}),
			screenshotter2.loadCape(cape, {backEquipment: "elytra"})
		]);
		screenshotter.render();
		screenshotter2.render();
	} catch {}
	setTimeout(function() {
		document.getElementById("hider").style.display = "block";
	}, 500);
}

doRender();