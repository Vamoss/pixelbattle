import { version } from '../package.json';
var cacheName = 'PixelBattle-v'+version;
console.log(cacheName);

var filesToCache = [
	'/',
	'/index.html',
	'/assets/js/index.js',
	'/assets/css/style.css',
];

self.addEventListener('install', e => {
	e.waitUntil(
		caches.open(cacheName).then(cache => {
			return cache.addAll(filesToCache)
					.then(() => self.skipWaiting());
		})
	);
});

self.addEventListener('activate', event => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.open(cacheName)
			.then(cache => cache.match(event.request, {ignoreSearch: true}))
			.then(response => {
			return response || fetch(event.request);
		})
	);
});