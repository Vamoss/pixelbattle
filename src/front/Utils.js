class Utils {
	static map(x, inMin, inMax, outMin, outMax) {
		return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	};

	static latLongToCoord(latLng, zoom, crs, tileSize){
		const layerPoint = crs.latLngToPoint(latLng, zoom).floor();
		const tile = layerPoint.divideBy(tileSize).floor();
		return {x: tile.x, y:tile.y, z: zoom};
	}

	static coordToLatLong(x, y, zoom, crs, tileSize, tilesInMaximumZoom){
		return crs.pointToLatLng({
				x: x/tilesInMaximumZoom*tileSize, 
				y:y/tilesInMaximumZoom*tileSize
			}, zoom);
	}
}

export default Utils