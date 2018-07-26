if(process.env.NODE_ENV === 'production' && window.location.hostname.indexOf("pixelbattle.com.br")==-1){
	window.location.href = "https://pixelbattle.com.br";
}

import Utils from './Utils.js';
import './gridLayer.js';
import colorController from './colorController.js';

var L = require('leaflet')
import 'leaflet-search';

//map
var mapEl = document.createElement('div');
mapEl.id = 'map';
document.body.appendChild(mapEl);

var map = L.map('map', {
	minZoom: 13,
	maxZoom: 19
});
map.setView([-22.9707, -43.1823], 15);
map.doubleClickZoom.disable(); 

var osm_mapnik = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
	maxZoom: map.getMaxZoom(),
	subdomains:['mt0','mt1','mt2','mt3'],
	attribution: '&copy; OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var pixelBattle = L.gridLayer.pixelBattle();
map.addLayer( pixelBattle );

//search
var search = new L.Control.Search({
	url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
	jsonpParam: 'json_callback',
	propertyName: 'display_name',
	propertyLoc: ['lat','lon'],
	marker: false,
	autoCollapse: true,
	autoType: false,
	minLength: 2
});
search.addEventListener('search:locationfound', event => {
	//console.log("searched", event);
});
map.addControl(search);
var searchButtonEl = document.getElementsByClassName("search-button")[0];
searchButtonEl.onclick = function(event) {
	changeMode(Mode.NAVIGATE);
};

//lock drawing
var lockOptions = {color: "#444444", weight: 1, fillOpacity: 0.7};
var lockLayer = L.rectangle([[-90, -180], [90, 180]], lockOptions);
lockLayer.addTo(map);

//user location
var user_location = L.latLng(0, 0);
var user_location_loaded = L.latLng(0, 0);
var area_util;
function onLocationFound(e) {
	if(autoLocationIntervalId==-1) return;
	gpsErrorEl.style.display = "none";
	user_location = e.latlng;
	blockView(user_location);
	shouldCentralize(user_location);
	map.removeLayer(lockLayer);

	//TODO
	//1- DONE - verificar se esta na mesma posicao e nao deixar passar
	//2- fazer a area ao redor
	//3- filtrar a query
	//4- no modo visualizacao passar a localizacao escrolada e implementar o mesmo algoritimo
	var distance = user_location_loaded.distanceTo(user_location);
	//console.log("Distance: ", distance);

	if(distance<10000) return;//Rio de Janeiro => Duque de Caxias
	user_location_loaded = user_location;

	//console.log("Loading: ", user_location);
	var coords = Utils.latLongToCoord(user_location, map.getZoom(), map.options.crs);
	var perLine = pixelBattle.getTilePerLine(map.getZoom());
	var tileX = coords.x * perLine;
	var tileY = coords.y * perLine;
	//console.log(coords);
	//console.log(tileX, tileY);
	
	pixelBattle.DB.load(tileX, tileY);
	// zoom the map to the rectangle bounds
	//map.fitBounds(bounds);
}

var gpsErrorEl = document.getElementById("gpsError");
function onLocationError(e) {
	if(autoLocationIntervalId==-1) return;
	gpsErrorEl.style.display = "block";
	console.log(e.message);
	map.addLayer(lockLayer);
}

function locate() {
	map.locate();
}

function shouldCentralize(user_location){
	var size = 0.001;
	var x1 = user_location.lng-size;
	var y1 = user_location.lat+size;
	var w1 = user_location.lng+size;
	var h1 = user_location.lat-size;

	var bounds = map.getBounds();
	var x2 = bounds._southWest.lng;
	var y2 = bounds._northEast.lat;
	var w2 = bounds._northEast.lng;
	var h2 = bounds._southWest.lat;

	if(x1 > w2 || y1 < h2 || w1 < x2 || h1 > y2){
		map.setView(user_location);
	}
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

var autoLocationIntervalId = -1;
function startAutoLocation(){
	if(autoLocationIntervalId!=-1)
		clearInterval(autoLocationIntervalId);
	autoLocationIntervalId = setInterval(locate, 3000);
	locate();
}

function stopAutoLocation(){
	clearInterval(autoLocationIntervalId);
	autoLocationIntervalId = -1;
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);


//timeline
var timeEl = document.getElementById('time');
var timeLabelEl = document.getElementById('timeLabel');
var beginDate = new Date(2018, 2, 26).getTime();
var endDate = new Date().getTime() + (1000*60*60*24);
window.time = endDate;
function pad2(number) {
   return (number < 10 ? '0' : '') + number
}
function formatDate(date){
	var dateFormatted = pad2(date.getDate())+"-"+pad2(date.getMonth())+"-"+date.getFullYear()+" "+pad2(date.getHours())+":"+pad2(date.getMinutes());
	return dateFormatted;
}
function updateLabel(){
	var time =  beginDate + (endDate - beginDate) * timeEl.value;
	var date = new Date(time);
	timeLabelEl.innerHTML = formatDate(new Date(date));
}
function updateTime(){
	var prevTime = window.time;
	window.time =  beginDate + (endDate - beginDate) * timeEl.value;
	if(window.time!=prevTime) pixelBattle.redraw();
}
timeEl.oninput= e => updateLabel();
timeEl.onchange= e => updateTime();
updateLabel();
updateTime();

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

		timeEl.value = 1;
		updateLabel();
		updateTime();

		pixelBattle.enable();

		if(pixelBattle.DB.fake) {
			pixelBattle.DB.load(0, 0);
		}else{
			startAutoLocation();
		}

		map.addLayer(lockLayer);
	}else if(mode==Mode.NAVIGATE){
		navModeEl.classList.add("active");
		navControlsEl.style.display = "";

		editModeEl.classList.remove("active");
		editControlsEl.style.display = "none";

		pixelBattle.disable();
		
		map.removeLayer(lockLayer);
		if(area_util) map.removeLayer(area_util);

		stopAutoLocation();
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
var colorControl = new colorController();
colorControl.on('onColorAdded', resize);

function resize(){
	mapEl.style.height = (window.innerHeight - controlsEl.clientHeight) + 'px';
	timeEl.style.width = (window.innerWidth - 130) + 'px';
}
window.onresize = resize;
resize();


//service worker
if('serviceWorker' in navigator) {
	navigator.serviceWorker.register('./serviceWorker.js', { scope: '/' }).then(function(registration) {
		//console.log('Service Worker Registered');
	});

	navigator.serviceWorker.ready.then(function(registration) {
		//console.log('Service Worker Ready');
	});
}