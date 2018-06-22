import _ from 'lodash';
import './gridLayer.js';

var L = require('leaflet')


//map
var mapEl = document.createElement('div');
mapEl.id = 'map';
document.body.appendChild(mapEl);

var map = L.map('map', {
	minZoom: 15,
    maxZoom: 19
});
map.setView([-22.9707, -43.1823], 15);

var osm_mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: map.getMaxZoom(),
	attribution: '&copy; OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var pixelBattle = L.gridLayer.pixelBattle();
map.addLayer( pixelBattle );

//lock drawing
var lockOptions = {color: "#444444", weight: 1, fillOpacity: 0.7};
var lockLayer = L.rectangle([[-90, -180], [90, 180]], lockOptions);
lockLayer.addTo(map);

//user location
var user_location = {};
var area_util;
function onLocationFound(e) {
	user_location = e.latlng;
	map.setView(user_location)
	blockView(user_location);
	map.removeLayer(lockLayer);
	// zoom the map to the rectangle bounds
	//map.fitBounds(bounds);
}

function onLocationError(e) {
	console.log(e.message);
	map.addLayer(lockLayer);
}

function locate() {
	map.locate();
}

function blockView(latlng){
	var size = 0.001;
	
	var x = latlng.lat-size;
	var y = latlng.lng-size;
	var w = latlng.lat+size;
	var h = latlng.lng+size;
	
	var size = 1;
	var x2 = latlng.lat-size;
	var y2 = latlng.lng-size;
	var w2 = latlng.lat+size;
	var h2 = latlng.lng+size;

	// define rectangle geographical bounds
	if(area_util) map.removeLayer(area_util);
	
	var bounds = [[x, y], [w, h]];
	//area_util = L.rectangle(bounds, {color: "#ff7800", weight: 1});
	area_util = L.polygon(
		[
			[
				[x2,y2],[w2,y2],[w2,h2],[x2,h2]
			],
        	[
        		[x,y],[w,y],[w,h],[x,h]
        	]
        ], lockOptions);
	area_util.addTo(map);

}

setInterval(locate, 3000);

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);


//mode
var editModeEl = document.getElementById('editMode');
var navModeEl = document.getElementById('navigateMode');
var editControlsEl = document.getElementById('editControls');
var navControlsEl = document.getElementById('navigateControls');

const Mode = {
    EDIT : 0,
    NAVIGATE : 1
}
var mode;

function changeMode(m){
	mode = m;
	if(mode==Mode.EDIT){
		editModeEl.classList.add("active");
		editControlsEl.style.display = "";

		navControlsEl.style.display = "none";
		navModeEl.classList.remove("active");
	}else if(mode==Mode.NAVIGATE){
		navModeEl.classList.add("active");
		navControlsEl.style.display = "";

		editModeEl.classList.remove("active");
		editControlsEl.style.display = "none";
	}
}
changeMode(Mode.EDIT);

editModeEl.onclick = function(event) {
	changeMode(Mode.EDIT);
};
navModeEl.onclick = function(event) {
	changeMode(Mode.NAVIGATE);
};


//colors
var controlsEl = document.getElementById('controls');
var colorsEl = document.getElementById('colors');
var revealColorSelectEl = document.getElementById('revealColorSelect');
var colorSelectEl = document.getElementById('colorSelect');
var newColorEl = document.getElementById('newColor');
var redEl = document.getElementById('red');
var greenEl = document.getElementById('green');
var blueEl = document.getElementById('blue');
var addNewColorEl = document.getElementById('addNewColor');

function getRGB(str){
  var match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
  return match ? {
    r: match[1],
    g: match[2],
    b: match[3]
  } : {};
}

function selectColor(event){
	var aColorEl = colorsEl.getElementsByTagName('div');
	for (var i = 0; i < aColorEl.length; i++) {
		if(event.target==aColorEl[i]){
			aColorEl[i].className = 'color selected';
			window.color = getRGB(aColorEl[i].style.backgroundColor);
		}else{
			aColorEl[i].className = 'color';
		}
	}
}

function addColor(value){
	var colorEl = document.createElement('div');
	colorEl.className = 'color';
	colorEl.style.backgroundColor = value;
	colorEl.onclick = selectColor;
	colorsEl.appendChild(colorEl);
}

//add default colors and select the first
addColor('#fc4c4f');
addColor('#4fa3fc');
addColor('#ecd13f');
colorsEl.getElementsByTagName('div')[0].click();

//when "New Color" is pressed
revealColorSelectEl.onclick = function(event){
    event.stopPropagation();
	redEl.value = 255*Math.random();
	greenEl.value = 255*Math.random();
	blueEl.value = 255*Math.random();
	changeColor();
	colorSelectEl.style.display = 'block';
};

//auto close 'new color panel' when click outside it
window.onclick = function(event) {
	colorSelectEl.style.display = 'none';
};

//disable auto close on 'new color panel'
colorSelectEl.onclick = function(event) {
	event.stopPropagation();
};

//update the new color span
function changeColor() {
	newColorEl.style.backgroundColor = "rgb(" + redEl.value + "," + greenEl.value + ", " + blueEl.value + ")";
}

//When color sliders change
redEl.addEventListener('input', changeColor);
greenEl.addEventListener('input', changeColor);
blueEl.addEventListener('input', changeColor);

//When "Add Color" is pressed
addNewColorEl.onclick = function(event){
	addColor(newColor.style.backgroundColor);

	//Select the new color
	var aColorEl = colorsEl.getElementsByTagName('div');
	aColorEl[aColorEl.length-1].click();

	colorSelectEl.style.display = 'none';
	resize();
};

function resize(){
	mapEl.style.height = (window.innerHeight - controlsEl.clientHeight) + 'px';
}
window.onresize = resize;
resize();