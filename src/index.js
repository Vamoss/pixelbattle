import _ from 'lodash';
import './index.less';
import './gridLayer.js';

var L = require('leaflet')

var mapEl = document.createElement('div');
mapEl.id = 'map';
document.body.appendChild(mapEl);

var map = L.map('map');
map.setView([-22.9707, -43.1823], 15);

var osm_mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.addLayer( L.gridLayer.pixelBattle() );