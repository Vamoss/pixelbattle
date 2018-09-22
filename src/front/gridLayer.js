import {Point} from '../../node_modules/leaflet/src/geometry/Point';
import DB from './DB.js'
import Utils from './Utils.js';
import SnakeLoader from './Snake.js'
var L = require('leaflet')
	
//suppose maximum zoom is 19
//total tiles at maximum zoom are 524288==2^19
//coords.x and coords.y start from 0 to 524287
//coords.z = current zoom

L.GridLayer.PixelBattle = L.GridLayer.extend({
	map: null,

	//probably 19
	maxZoom: -1,

	//number of tiles in the maximum zoom
	tilesInMaximumZoom: 4,

	mouse: {x: -1, y: -1},

	DB: new DB(),

	enabled: true,

	//when true, it creates a <div> that will contain <canvas>
	//when false, the <canvas> will be the only element
	debug: false,

	loaders: [],

	loaded: false,

	loaderLastUpdate: 0,

	//called once
	onAdd: function(map) {
		this.map = map;

		this.maxZoom = map.getMaxZoom();

		this.DB.on('onData', data => this.onDataChange.call(this, data));

		//this.addEventListener('tileunload', event => console.log(event));

		if(!this.loaded){
			window.requestAnimationFrame(time => this.drawLoaders.call(this, time));
		}
		
		//call after initialization
		L.GridLayer.prototype.onAdd.call(this, map);
	},

	//called after onAdd, everytime a tile is created
	createTile: function (coords) {
		if(coords.z<13) return document.createElement('span');
		var canvas = document.createElement('canvas');

		var tileSize = this.getTileSize();
		canvas.setAttribute('width', tileSize.x);
		canvas.setAttribute('height', tileSize.y);

		var tile;
		if(this.debug){
			tile = document.createElement('div');
			tile.innerHTML = [coords.x, coords.y, coords.z].join(', ') + '<br/>' + [coords.x*this.tilesInMaximumZoom, coords.y*this.tilesInMaximumZoom, coords.z*this.tilesInMaximumZoom].join(', ');
			tile.style.outline = '1px solid red';
			tile.style.color = '#000';
			tile.appendChild(canvas);
		}else{
			tile = canvas;
		}

		tile.setAttribute('data-coord', JSON.stringify(coords));

		if(!this.loaded){
			tile.setAttribute('data-loader-index', this.loaders.length);
			var zoom = coords.z;
			if(zoom < this.map.getMinZoom()+2) zoom = this.map.getMinZoom() + 2;
			var perLine = this.getTilePerLine(zoom);
			this.loaders.push(new SnakeLoader(tileSize.x, tileSize.y, perLine));
		}

		this.draw(tile);

		return tile;
	},

	//called after createTile, everytime a tile is created
	_initTile: function (tile) {
		L.GridLayer.prototype._initTile.call(this, tile);

		if(tile.tagName == 'SPAN') return;

		//enable mouse move
		tile.style.pointerEvents = "auto";//default is none

		if('ontouchstart' in window)
			tile.ontouchstart = event => this.onMouseDown.call(this, event, tile);
		else
			tile.onmousedown = event => this.onMouseDown.call(this, event, tile);
		
		if('ontouchend' in window)
			tile.ontouchend = event => this.onMouseClick.call(this, event, tile);
		else
			tile.onmouseup = event => this.onMouseClick.call(this, event, tile);
		
		if('ontouchmove' in window)
			tile.ontouchmove = event => this.onMouseMove.call(this, event, tile);
		else
			tile.onmousemove = event => this.onMouseMove.call(this, event, tile);
		
		if('ontouchcancel' in window)
			tile.ontouchcancel = event => this.onMouseLeave.call(this, event, tile);
		else
			tile.onmouseleave = event => this.onMouseLeave.call(this, event, tile);

		tile.addEventListener('redraw', event => this.onTileDataChange(tile, event.detail));
	},

	getMouseXY: function(event, element) {
		var rect = element.getBoundingClientRect();
		var scrollTop = document.documentElement.scrollTop?document.documentElement.scrollTop:document.body.scrollTop;
		var scrollLeft = document.documentElement.scrollLeft?document.documentElement.scrollLeft:document.body.scrollLeft;
		var elementLeft = rect.left+scrollLeft;  
		var elementTop = rect.top+scrollTop;

		var mouseX = event.touches ? event.touches[0].pageX : event.pageX;
		var mouseY = event.touches ? event.touches[0].pageY : event.pageY;
		var x = mouseX-elementLeft;
		var y = mouseY-elementTop;

		return {x:x, y:y};
	},

	getCoords: function(tile) {
		var dataCoord = JSON.parse(tile.getAttribute('data-coord'));
		var coords = new Point(dataCoord.x, dataCoord.y);
		coords.z = dataCoord.z;
		return coords;
	},

	onMouseDown(event, tile) {
		this.initDrag = this.getMouseXY(event, tile);
		this.mouse = new Point(this.initDrag.x, this.initDrag.y);
  		this.draw(tile);
	},

	onMouseMove: function(event, tile){
		if(!this.enabled) return;
		if(event.type=="mousemove")
			tile.setAttribute('data-mouse-over', "true");
		var pos = this.getMouseXY(event, tile);
		this.mouse = new Point(pos.x, pos.y);
  		this.draw(tile);
	},

	onMouseLeave: function(event, tile){
		if(!this.enabled) return;
		tile.setAttribute('data-mouse-over', "false");
  		this.draw(tile);
	},

	onMouseClick: function(event, tile){
		if(!this.enabled) return;

		//prevent click when user has dragged
		if(this.initDrag.x == this.mouse.x && this.initDrag.y == this.mouse.y){
			var coords = this.getCoords(tile);

			var perLine = this.getTilePerLine(coords.z);
			
			var tileSize = this.getTileSize();
			var size = tileSize.x/perLine;

			var idX = coords.x * perLine + Math.floor(this.mouse.x/size);
			var idY = coords.y * perLine + Math.floor(this.mouse.y/size);
			
			this.DB.save(idX, idY);
			this.draw(tile);
		}
	},

	getTilePerLine(zoom){
		return this.tilesInMaximumZoom * Math.pow(2, (this.maxZoom-zoom));
	},

	onDataChange: function(data){
		if(!this.loaded){
			this.loaded = true;

			Object.keys(this._tiles).forEach(key => {
				var tile = this._tiles[key].el;
				this.draw(tile);
			});

			//delete all loaders
			for(var i=this.loaders.length-1; i>=0; i--){
				delete this.loaders[i];
			}
			this.loaders = [];
		}

		var event = new CustomEvent('redraw', {detail: data});
		for(var tile in this._tiles){
			this._tiles[tile].el.dispatchEvent(event);
		}
	},

	onTileDataChange: function(tile, data){
		var coords = this.getCoords(tile);
		var perLine = this.getTilePerLine(coords.z);
		var tileX = coords.x * perLine;
		var tileY = coords.y * perLine;
		for (var i = 0, len = data.length; i < len; i++) {
			var x = data[i].x;
			var y = data[i].y;
			if(x >= tileX && x < tileX + perLine
			&& y >= tileY && y < tileY + perLine){
				this.draw(tile);
				if(this.debug){
					var context;
					if(this.debug){
						context = tile.querySelector('canvas').getContext('2d');
					}else{
						context = tile.getContext('2d');
					}
					context.fillStyle = 'rgba(255,0,0,.1)';
					context.beginPath();
					var tileSize = this.getTileSize();
					context.rect(0,0,tileSize.x,tileSize.y);
					context.fill();
				}
				return;
			}
		}
	},

	draw: function(tile) {
		var coords = this.getCoords(tile);
		
		var perLine = this.getTilePerLine(coords.z);
		
		var tileSize = this.getTileSize();
		var size = tileSize.x/perLine;

		var context;
		if(this.debug){
			context = tile.querySelector('canvas').getContext('2d');
		}else{
			context = tile.getContext('2d');
		}
		context.clearRect(0, 0, tileSize.x, tileSize.y);

		//grid
		if(coords.z >= 15) {
			context.strokeStyle = 'rgba(0,0,0,0.3)';
			context.beginPath();
			for (var x = 0; x <= tileSize.x; x += size) {
				context.moveTo(x, 0);
				context.lineTo(x, tileSize.y);
			}
			for (var y = 0; y <= tileSize.y; y += size) {
				context.moveTo(0, y);
				context.lineTo(tileSize.x, y);
			}
			context.stroke();
		}

		//pixels painted
		var data = this.DB.getData(coords, perLine);
		for(var i=0; i<data.length; i++){
			var x = data[i].x - (coords.x * perLine);//0, 1, 2...
			var y = data[i].y - (coords.y * perLine);//0, 1, 2...
			context.beginPath();
			context.fillStyle = 'rgba('+data[i].r+','+data[i].g+','+data[i].b+',0.7';
			context.rect(x*size, y*size, size, size);
			context.fill();
		}
		
		//mouse over
		var mouseOver = tile.getAttribute('data-mouse-over')=="true";
		if(mouseOver){
			var mouseX = Math.floor((this.mouse.x)/size)*size;
			var mouseY = Math.floor((this.mouse.y)/size)*size;
			context.beginPath();
			context.fillStyle = 'rgba('+window.color.r+','+window.color.g+','+window.color.b+',0.7';
			context.rect(mouseX, mouseY, size, size);
			context.fill();
		}
	},

	enable(){
		this.enabled = true;
	},

	disable(){
		this.enabled = false;
	},

	drawLoaders(time){
		if(this.loaded) return;

		//transform minZoom to 1000ms/60fps = 16ms and maxZoom to 1000ms/3fps = 333ms
		var minimalInterval = Utils.map(this.map.getZoom(), this.map.getMinZoom(), this.map.getMaxZoom(), 16, 333);
		if(time-this.loaderLastUpdate>minimalInterval) {
			this.loaderLastUpdate = time;
			Object.keys(this._tiles).forEach(key => {
				var tile = this._tiles[key].el;
				var dataLoaderIndex = tile.getAttribute('data-loader-index');
				var loader = this.loaders[dataLoaderIndex];

				var context;
				if(this.debug){
					context = tile.querySelector('canvas').getContext('2d');
				}else{
					context = tile.getContext('2d');
				}

				loader.update();
				loader.draw(context);
			});
		}
		
		window.requestAnimationFrame(time => this.drawLoaders.call(this, time));
	}
});

L.gridLayer.pixelBattle = function(opts) {
    return new L.GridLayer.PixelBattle(opts);
};