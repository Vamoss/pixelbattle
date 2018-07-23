const EventEmitter = require('events')
var firebase = require('firebase/app');
require('firebase/database');

class DB extends EventEmitter {
	constructor () {
		super();
		this.dataLoaded = false;
		this.data = {}
		this.realtimeCallback = () => {};

		this.fake = false;

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
	}

	onLoad (snapshot) {
		this.dataLoaded = true;

		var values = snapshot.val();
		//console.log("Loaded:", values);
		for (var i in values) {
			var id = values[i].x + ':' + values[i].y;
			if(!this.data[id]) this.data[id] = [];
			this.data[id].push(values[i]);
		}
		this.emit('onData', values)
	}

	onNewData(snapshot){
		if(!this.dataLoaded) return;
		var value = snapshot.val();
		var id = value.x + ':' + value.y;
		if(!Array.isArray(this.data[id])) this.data[id] = [];
		this.data[id].push(value);
		this.emit('onData', {0:value})
	}

	load(idX, idY){
		if(this.fake){
			console.warn("LOADING FAKE DATA");
			var request = new XMLHttpRequest();
			request.open('GET', './data.json', true);
			request.onload = event => {
				if(request.status >= 200 && request.status < 400){
					var data = JSON.parse(request.responseText);
					this.dataLoaded = true;
					this.onLoad({val:function(){return data}});
					console.log(data);
				}else{
					console.log("error", event);
				}
			}
			request.send();
			return;
		}
		//remove previous listener for when new data is added
		if(this.dataLoaded)
			this.pixelsRef.off('child_added', this.realtimeCallback);
		else
			//load the first time
			this.pixelsRef.once('value', snapshot => {
				this.onLoad.call(this, snapshot);
			});
		
		//when new data is added
		this.realtimeCallback = snapshot => this.onNewData.call(this, snapshot);
		this.pixelsRef.limitToLast(1).on('child_added', this.realtimeCallback);
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
				if(this.data[id]){
					for(var i=this.data[id].length-1; i>=0; i--){
						if(this.data[id][i].time<=window.time){
							aData.push(this.data[id][i]);
							break;
						}
					}
				}
			}
		}
		return aData;
	}
}

export default DB
