function DB() {
	if (!DB.instance) {
		DB.instance = this;
	}

	DB.prototype.data = {};

	DB.prototype.load = function(tile){

	}

	DB.prototype.save = function(idX, idY){
		var id = idX + ':' + idY;
		this.data[id] = {
			time: new Date().getTime(),
			x: idX,
			y: idY,
			color: 'rgba('+window.color.r+','+window.color.g+','+window.color.b+',0.7)'
		};
	}

	DB.prototype.getData = function(coords, tilesInMaximumZoom, maxZoom){
		var aData = [];

		//at maximum zoom it is equals to 1, as the zoom decreases, the scale grows
		var scale = (maxZoom-coords.z+1);

		var total = Math.pow(tilesInMaximumZoom, scale+1);
		var perLine = Math.ceil(Math.sqrt(total));
		

		var xx = coords.x * perLine;
		var yy = coords.y * perLine;

		for(var x=0; x<perLine; x++){
			for(var y=0; y<perLine; y++){
				var id = (xx + x) + ':' + (yy + y);
				if(this.data[id]){
					aData.push(this.data[id]);
				}
			}
		}
		return aData;
	}

	return DB.instance;
}

module.exports = new DB();