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
	url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
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
	shouldLoad(event.latlng);
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
var area_util;
var inner_area_util = {};
function onLocationFound(e) {
	if(autoLocationIntervalId==-1) return;
	gpsErrorEl.style.display = "none";
	user_location = e.latlng;

	//inner area util
	//drawable area
	var size = 20 * 32;//32 one pixel
	var tileSize = pixelBattle.getTileSize().x;
	var coords = Utils.latLongToCoord(user_location, map.getMaxZoom(), map.options.crs, tileSize);
	var topLeft = map.unproject(L.point(coords.x*tileSize-size, coords.y*tileSize-size), map.getMaxZoom());
	var bottomRight = map.unproject(L.point(coords.x*tileSize+size, coords.y*tileSize+size), map.getMaxZoom());
	inner_area_util.x = bottomRight.lat;
	inner_area_util.y = bottomRight.lng;
	inner_area_util.w = topLeft.lat;
	inner_area_util.h = topLeft.lng;

	blockView(user_location);
	shouldCentralize(user_location);
	map.removeLayer(lockLayer);

	shouldLoad(user_location);
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
	var x1 = inner_area_util.h;
	var y1 = inner_area_util.w;
	var w1 = inner_area_util.y;
	var h1 = inner_area_util.x;
    
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
	var size = 1;
	var x2 = latlng.lat-size;
	var y2 = latlng.lng-size;
	var w2 = latlng.lat+size;
	var h2 = latlng.lng+size;

	// define rectangle geographical bounds
	if(area_util) map.removeLayer(area_util);
	
	var bounds = [[inner_area_util.x, inner_area_util.y], [inner_area_util.w, inner_area_util.h]];
	area_util = L.polygon(
		[
			[
				[x2,y2],[w2,y2],[w2,h2],[x2,h2]
			],
			[
				[inner_area_util.x,inner_area_util.y],[inner_area_util.w,inner_area_util.y],[inner_area_util.w,inner_area_util.h],[inner_area_util.x,inner_area_util.h]
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


map.on('dragend',function(e){
  shouldLoad(map.getCenter());
});

var user_location_loaded = {x:0, y:0, z:0};
function shouldLoad(latLng){
	var tileSize = pixelBattle.getTileSize().x;
	var coords = Utils.latLongToCoord(latLng, map.getMaxZoom(), map.options.crs, tileSize);
	var perLine = pixelBattle.getTilePerLine(map.getMaxZoom());
	coords.x *= perLine;
	coords.y *= perLine;
	var distanceX = Math.abs(coords.x-user_location_loaded.x);
	var distanceY = Math.abs(coords.y-user_location_loaded.y);
	//console.log("DistanceX: ", distanceX, " DistanceY: ", distanceY);

	if(distanceX<process.env.LOAD_DIST && distanceY<process.env.LOAD_DIST) return;
	user_location_loaded = coords;
	
	pixelBattle.DB.load(coords.x, coords.y);
}

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
	var dateFormatted = pad2(date.getDate())+"-"+pad2(date.getMonth()+1)+"-"+date.getFullYear()+" "+pad2(date.getHours())+":"+pad2(date.getMinutes());
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

//recent mode
var recentHistory = [];
var timeoutId = -1;
function locateRecent(){
	if(timeoutId>0) clearTimeout(timeoutId);
	if(pixelBattle.DB.dataRecentLoaded){
		var j = pixelBattle.DB.dataRecent.length-1;
		var value = pixelBattle.DB.dataRecent[j];
		var found = false;
		while(!found && j>=0){
			value = pixelBattle.DB.dataRecent[j];
			var isFarEnough = true;
			var i = 0;
			while(isFarEnough && i<recentHistory.length){
				if(Math.hypot(recentHistory[i].x-value.x, recentHistory[i].y-value.y)<200)
					isFarEnough = false;
				i++;
			}
			found = isFarEnough;
			j--;
		}
		if(!found){
			//reset
			recentHistory = [];
			value = pixelBattle.DB.dataRecent[pixelBattle.DB.dataRecent.length-1];
		}
		recentHistory.push(value);
		if(recentHistory.length>10)
			recentHistory.shift();
		var latLng = Utils.coordToLatLong(value.x, value.y, map.getMaxZoom(), map.options.crs, pixelBattle.getTileSize().x, pixelBattle.tilesInMaximumZoom);
		map.setView([latLng.lat, latLng.lng], 18);
		shouldLoad(latLng);
	}
	timeoutId = setTimeout(() => changeMode(Mode.NAVIGATE), 2000);
}
pixelBattle.DB.loadRecent();

//mode
var controlsEl = document.getElementById('controls');
var editModeEl = document.getElementById('editMode');
var navModeEl = document.getElementById('navigateMode');
var recentModeEl = document.getElementById('recentMode');
var editControlsEl = document.getElementById('editControls');
var navControlsEl = document.getElementById('navigateControls');

const Mode = {
	EDIT : 0,
	NAVIGATE : 1,
	RECENT : 2
}
var mode;

function changeMode(m){
	if(m==mode) return;
	mode = m;
	editModeEl.classList.remove("active");
	navModeEl.classList.remove("active");
	recentModeEl.classList.remove("active");

	editControlsEl.style.display = "none";
	navControlsEl.style.display = "none";

	if(mode==Mode.EDIT){
		editModeEl.classList.add("active");
		editControlsEl.style.display = "";

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

		pixelBattle.disable();
		
		map.removeLayer(lockLayer);
		if(area_util) map.removeLayer(area_util);

		stopAutoLocation();
	}else if(mode==Mode.RECENT){
		locateRecent();

		recentModeEl.classList.add("active");
		
		pixelBattle.disable();
		
		map.removeLayer(lockLayer);
		if(area_util) map.removeLayer(area_util);

		stopAutoLocation();
	}
	window.dispatchEvent(new Event('resize'));
}
changeMode(Mode.EDIT);

editModeEl.onclick = function(event) {
	changeMode(Mode.EDIT);
};
navModeEl.onclick = function(event) {
	changeMode(Mode.NAVIGATE);
};
recentModeEl.onclick = function(event) {
	changeMode(Mode.RECENT);
};


//colors
var colorControl = new colorController();
colorControl.on('onColorAdded', resize);
colorControl.on('onColorRemoved', resize);

function resize(){
	var minHeight = parseInt(window.getComputedStyle(controlsEl).getPropertyValue("min-height").replace('px', ''));
	if(mode==Mode.NAVIGATE || mode==Mode.RECENT){
		controlsEl.style.height = minHeight + 'px';
		mapEl.style.height = (window.innerHeight - minHeight - 5) + 'px';
	}else{
		controlsEl.style.height = editControlsEl.clientHeight + 'px';
		mapEl.style.height = (window.innerHeight - editControlsEl.clientHeight - 5) + 'px';
	}
	timeEl.style.width = (window.innerWidth - 180) + 'px';
}
window.onresize = resize;
resize();


//service worker
if('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
	navigator.serviceWorker.register('./serviceWorker.js', { scope: '/' }).then(function(registration) {
		//console.log('Service Worker Registered');
	});

	navigator.serviceWorker.ready.then(function(registration) {
		//console.log('Service Worker Ready');
	});
}