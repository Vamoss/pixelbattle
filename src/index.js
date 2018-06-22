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

map.addLayer( L.gridLayer.pixelBattle() );


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