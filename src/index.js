import _ from 'lodash';
import './index.less';

var L = require('leaflet')

var earthCincunferenceX = 40075000; //meters
var earthCincunferenceY = 40075000/2; //meters
var gridSpaceMeter = 10; //meters
var degreesToMeterX = 360*gridSpaceMeter*2/earthCincunferenceX;
var degreesToMeterY = 360*gridSpaceMeter/earthCincunferenceY;

var mapEl, map, canvasEl;

Math.map = function ( x, a1, a2, b1, b2 ) {
	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
}

function getMod(latLng){
	latLng.lng = Math.floor(latLng.lng/degreesToMeterX)*degreesToMeterX;
	latLng.lat = Math.ceil(latLng.lat/degreesToMeterY)*degreesToMeterY;
	return latLng;
}

function latLng2Point(latLng) {
	return map.latLngToContainerPoint(latLng)
}

function point2LatLng(point, zoom) {
	return map.unproject(point, zoom);
}

function draw(){
	var w = window.innerWidth;
	var h = window.innerHeight;
	canvasEl.width = w;
	canvasEl.height = h;

	var context = canvasEl.getContext('2d');
	context.clearRect(0, 0, canvasEl.width, canvasEl.height);

	if(map.getZoom()<15) return;

	var bounds = map.getBounds();

	//find initial top left mod
	var ne = bounds.getNorthEast();
	var sw = bounds.getSouthWest();
	var topLeft = latLng2Point(getMod(bounds.getNorthWest()));
	context.beginPath();
	context.arc(topLeft.x,topLeft.y,200,0,2*Math.PI);
	context.stroke();
	
	//find screen size in lat lng
	var spaceX = w * degreesToMeterX / Math.abs(ne.lng-sw.lng)
	var spaceY = h * degreesToMeterY / Math.abs(ne.lat-sw.lat)
	
	for (var x = topLeft.x; x <= w+spaceX; x += spaceX) {
		context.moveTo(x, topLeft.y);
		context.lineTo(x, h);
	}

	for (var y = topLeft.y; y <= h+spaceY; y += spaceY) {
		context.moveTo(topLeft.x, y);
		context.lineTo(w, y);
	}

	context.strokeStyle = "black";
	context.stroke();
}

function init(){
	mapEl = document.createElement('div');
	mapEl.id = 'map';
	document.body.appendChild(mapEl);
	
	canvasEl = document.createElement('canvas');
	document.body.appendChild(canvasEl);

	map = L.map('map');
	map.setView([-22.9707, -43.1823], 15);

	var osm_mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);

	//window.addEventListener('resize', draw, false);
	map.on('move', draw);
	map.on('zoom', draw);

	draw();
}

init();