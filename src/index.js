import _ from 'lodash';
import './index.less';

var earthCincunferenceX = 40075000; //meters
var earthCincunferenceY = 23450000; //meters
var gridSpaceMeter = 40; //meters
var degreesToMeterX = 360*gridSpaceMeter/earthCincunferenceX;
var degreesToMeterY = 360*gridSpaceMeter/earthCincunferenceY;
console.log(degreesToMeterX, degreesToMeterY)
var map;

var mapEl = document.createElement('div');
mapEl.id = 'map';
document.body.appendChild(mapEl);

var canvasEl = document.createElement('canvas');
document.body.appendChild(canvasEl);

Math.map = function ( x, a1, a2, b1, b2 ) {
	return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );
}

function getLatLngMod(latLng){
	return new google.maps.LatLng(
		Math.ceil(latLng.lat()/degreesToMeterY)*degreesToMeterY,
		Math.floor(latLng.lng()/degreesToMeterX)*degreesToMeterX
	);
}

function latLng2Point(latLng, map) {
	var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
	var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
	var scale = Math.pow(2, map.getZoom());
	var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
	return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
}

function point2LatLng(point, map) {
	var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
	var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
	var scale = Math.pow(2, map.getZoom());
	var worldPoint = new google.maps.Point(point.x / scale + bottomLeft.x, point.y / scale + topRight.y);
	return map.getProjection().fromPointToLatLng(worldPoint);
}

function drawGrid(){
	if(map.getZoom()<14) return;
	var context = canvasEl.getContext('2d');
	context.clearRect(0, 0, canvasEl.width, canvasEl.height);

	var point = latLng2Point(new google.maps.LatLng(0, 0), map);
	context.beginPath();
	context.arc(point.x,point.y,10,0,2*Math.PI);
	context.stroke();
	
	//find initial top left mod
	var topRight = map.getBounds().getNorthEast();
	var bottomLeft = map.getBounds().getSouthWest();
	var topLeftMod = getLatLngMod(new google.maps.LatLng(topRight.lat(), bottomLeft.lng()));
	var topLeftModPoint = latLng2Point(topLeftMod, map)
	context.beginPath();
	context.arc(topLeftModPoint.x,topLeftModPoint.y,200,0,2*Math.PI);
	context.stroke();

	//find screen size in lat lng
	var space = window.innerWidth * degreesToMeterX / Math.abs(topRight.lng()-bottomLeft.lng())
	console.log(Math.abs(topRight.lng()-bottomLeft.lng()))
	var bw = window.innerWidth;
	var bh = window.innerHeight;
	var p = 10;

	for (var x = topLeftModPoint.x; x <= bw+space; x += space) {
		context.moveTo(x, topLeftModPoint.y);
		context.lineTo(x, bh);
	}


	for (var y = topLeftModPoint.y; y <= bh+space; y += space) {
		context.moveTo(topLeftModPoint.x, y);
		context.lineTo(bw, y);
	}

	context.strokeStyle = "black";
	context.stroke();
}

function draw(){
	canvasEl.width = window.innerWidth;
	canvasEl.height = window.innerHeight;
	drawGrid();
}

function init(google){
	var mapOptions = {
		zoom: 15,
		//meridian
		//center: new google.maps.LatLng(0, 0),
		//rio de janeiro
		center: new google.maps.LatLng(-22.9707, -43.1823),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map=new google.maps.Map(mapEl, mapOptions);
	var flightPlanCoordinates = [
		{lat: 0, lng: 0},
		{lat: 0, lng: 360}
	];
	
	window.addEventListener('resize', draw, false);
	map.addListener('drag', draw);
	map.addListener('idle', draw);
	map.addListener('zoom_changed', draw);
}

var GoogleMapsLoader = require('google-maps');
GoogleMapsLoader.load(init);