const EventEmitter = require('events')
import io from 'socket.io-client';

class DB extends EventEmitter {
	constructor () {
		super();
		this.dataLoaded = false;
		this.data = {};
		this.dataRecent = [];
		this.socket = io('//');
		this.socket.on('socketToMe', data => this.onNewData.call(this, data));
		
		this.fake = false;
	}

	onLoad (values) {
		this.dataLoaded = true;
		this.data = {}

		values.sort(function (a, b) {
		  return a.time-b.time;
		});

		//console.log("Loaded:", values);
		for (var i in values) {
			var id = values[i].x + ':' + values[i].y;
			if(!this.data[id]) this.data[id] = [];
			this.data[id].push(values[i]);
			this.dataRecent.push(values[i]);
			if(this.dataRecent.length>10000)
				this.dataRecent.shift();
		}
		this.emit('onData', values)
	}

	onNewData(data){
		//console.log("onNewData", data, this.dataLoaded);
		if(!this.dataLoaded) return;
		var id = data.x + ':' + data.y;
		if(!Array.isArray(this.data[id])) this.data[id] = [];
		this.data[id].push(data);
		this.dataRecent.push(data);
		if(this.dataRecent.length>10000)
			this.dataRecent.shift();
		this.emit('onData', [data])
	}

	load(idX, idY){
		var url = "/getAll/" + idX + "/" + idY;
		if(this.fake){
			console.warn("LOADING FAKE DATA");
			url = '/data.json';
		}	

		var httpRequest = new XMLHttpRequest();
			httpRequest.responseType = 'json';
			httpRequest.onload = e => {
				if(httpRequest.status >= 200 && httpRequest.status < 400){
					var data = httpRequest.response;
					if(this.fake) data = JSON.parse(request.responseText);
					console.log('data loaded:', data.length);
					this.onLoad(data);
				}else{
					console.error('could not load the data...');
				}
			}
			httpRequest.open('GET', url	);
			httpRequest.send();
	}

	save(idX, idY){
		var id = idX + ':' + idY;
		var url = "/save/" + idX + "/" + idY + "/" + window.color.r + '/' + window.color.g + '/' + window.color.b;
			var httpRequest = new XMLHttpRequest();
			httpRequest.open('GET', url);
			httpRequest.send();
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
