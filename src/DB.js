const EventEmitter = require('events')

var firebase = require('firebase/app');
require('firebase/database');

class DB extends EventEmitter {
	constructor () {
		super();
		this.data = {}

		var config = {
			apiKey: process.env.API_KEY,
			authDomain: process.env.AUTH_DOMAIN,
			databaseURL: process.env.DATABASE_URL,
			projectId: process.env.PROJECT_ID,
			storageBucket: "",
			messagingSenderId: process.env.MESSAGING_SENDER_ID
		};
		var app = firebase.initializeApp(config);
		this.pixelsRef = firebase.app().database().ref('/pixels');
		var t = this;

		//TODO
		//query only necessary data visible in the map
		//only the last per pixel

		var initialDataLoaded = false;
		//load the first time
		this.pixelsRef
		.once('value', function(snapshot) {
			initialDataLoaded = true;
			var values = snapshot.val();
			for (var i in values) {
				var id = values[i].x + ':' + values[i].y;
				t.data[id] = values[i];
			}
			t.emit('onData', values)
		});

		//when some child is changed
		this.pixelsRef
		.limitToLast(1)
		.on('child_added', function(snapshot) {
			if(!initialDataLoaded) return;
			var value = snapshot.val();
			var id = value.x + ':' + value.y;
			t.data[id] = value;
			t.emit('onData', {0:value})
		});
	}

	load(tile){

	}

	save(idX, idY){
		var id = idX + ':' + idY;
		this.data[id] = {
			time: new Date().getTime(),
			x: idX,
			y: idY,
			color: 'rgba('+window.color.r+','+window.color.g+','+window.color.b+',0.7)'
		};
		this.pixelsRef.push(this.data[id]);
	}

	getData(coords, perLine){
		var aData = [];

		var xx = coords.x * perLine;
		var yy = coords.y * perLine;

		for(var x=0; x<perLine; x++){
			for(var y=0; y<perLine; y++){
				var id = (xx + x) + ':' + (yy + y);
				if(this.data[id] && this.data[id].time<=window.time){
					aData.push(this.data[id]);
				}
			}
		}
		return aData;
	}
}

export default DB
