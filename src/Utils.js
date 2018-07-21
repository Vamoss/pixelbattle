class Utils {
	static map(x, inMin, inMax, outMin, outMax) {
		return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	};

	static latLongToCoord(latLng, zoom, crs){
		const tileSize = 256;
		const layerPoint = crs.latLngToPoint(latLng, zoom).floor();
		const tile = layerPoint.divideBy(tileSize).floor();
		return {x: tile.x, y:tile.y, z: zoom};
	}
}

export default Utils