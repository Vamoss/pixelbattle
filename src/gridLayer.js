import {Point} from '../node_modules/leaflet/src/geometry/Point';
var L = require('leaflet')
	
//suppose maximum zoom is 19
//total tiles at maximum zoom are 524288==2^19
//coords.x and coords.y start from 0 to 524287
//coords.z = current zoom

L.GridLayer.PixelBattle = L.GridLayer.extend({
	//probably 19
	maxZoom: -1,

	//number of tiles in the maximum zoom
	tilesInMaximumZoom: 4,

	//2097152 = (2^19)*4 = (2^maximumZoom)*tilesInMaximumZoom
	maxId: -1,

	mouse: {x: -1, y: -1},

	//called once
	onAdd: function(map) {
		this.maxZoom = map.getMaxZoom();
		this.maxId = Math.pow(2, this.maxZoom) * this.tilesInMaximumZoom;
		this.map = map;
		//call after initialization
		L.GridLayer.prototype.onAdd.call(this, map);
	},

	//called after onAdd, everytime a tile is created
	createTile: function (coords) {
		
		var canvas = document.createElement('canvas');

		var tileSize = this.getTileSize();
		canvas.setAttribute('width', tileSize.x);
		canvas.setAttribute('height', tileSize.y);

		var tile = document.createElement('div');
		tile.innerHTML = [coords.x, coords.y, coords.z].join(', ');
		tile.style.outline = '1px solid red';
		tile.style.color = '#fff';
		tile.appendChild(canvas);

		tile.setAttribute('data-coord', JSON.stringify(coords));
		
		this.draw(tile);

		return tile;
	},

	//called after createTile, everytime a tile is created
	_initTile: function (tile) {
		L.GridLayer.prototype._initTile.call(this, tile);

		//enable mouse move
		tile.style.pointerEvents = "auto";//default is none
		var t = this;
		tile.onmousemove = function(event) {
			t.onMouseMove.call(t, event, tile);
		}

		tile.onmouseleave = function(event) {
			t.onMouseLeave.call(t, event, tile);
		}
	},

	getXY: function(evt, element) {
		var rect = element.getBoundingClientRect();
		var scrollTop = document.documentElement.scrollTop?document.documentElement.scrollTop:document.body.scrollTop;
		var scrollLeft = document.documentElement.scrollLeft?document.documentElement.scrollLeft:document.body.scrollLeft;
		var elementLeft = rect.left+scrollLeft;  
		var elementTop = rect.top+scrollTop;

		var x = evt.pageX-elementLeft;
		var y = evt.pageY-elementTop;

		return {x:x, y:y};
	},

	onMouseMove: function(event, tile){
		tile.setAttribute('data-mouse-over', "true");
		var pos = this.getXY(event, tile);
		this.mouse = new Point(pos.x, pos.y);
  		this.draw(tile);
	},

	onMouseLeave: function(event, tile){
		tile.setAttribute('data-mouse-over', "false");
  		this.draw(tile);
	},

	draw: function(tile) {
		var dataCoord = JSON.parse(tile.getAttribute('data-coord'));
		var coords = new Point(dataCoord.x, dataCoord.y);
		coords.z = dataCoord.z;

		//at maximum zoom it is equals to 1, as the zoom decreases, the scale grows
		var scale = (this.maxZoom-coords.z+1);

		//grid calculation
		//code from: https://www.openprocessing.org/sketch/386216
		var total = Math.pow(this.tilesInMaximumZoom, scale+1);
		var perLine = Math.ceil(Math.sqrt(total));
		
		var tileSize = this.getTileSize();
		var size = tileSize.x/perLine;
		
		var context = tile.querySelector('canvas').getContext('2d');
		context.clearRect(0, 0, tileSize.x, tileSize.y);
		context.strokeStyle = 'rgba(0,0,0,0.7)';
		context.beginPath();
		for(var i=0; i<total; i++){
			context.rect(size*(i%perLine), size*Math.floor(i/perLine), size, size);
		}
		context.stroke();

		var mouseOver = tile.getAttribute('data-mouse-over')=="true";
		if(mouseOver){
			var mouseX = Math.floor((this.mouse.x)/size)*size;
			var mouseY = Math.floor((this.mouse.y)/size)*size;
			context.beginPath();
			context.fillStyle = 'rgba(0,0,0,0.7)';
			context.rect(mouseX, mouseY, size, size);
			context.fill();
		}
	},
});

L.gridLayer.pixelBattle = function(opts) {
    return new L.GridLayer.PixelBattle(opts);
};