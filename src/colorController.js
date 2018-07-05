const EventEmitter = require('events')

class colorController extends EventEmitter {
	constructor () {
		super();
		//colors
		this.colorsEl = document.getElementById('colors');
		console.log(this.colorsEl);
		this.revealColorSelectEl = document.getElementById('revealColorSelect');
		this.colorSelectEl = document.getElementById('colorSelect');
		this.newColorEl = document.getElementById('newColor');
		this.redEl = document.getElementById('red');
		this.greenEl = document.getElementById('green');
		this.blueEl = document.getElementById('blue');
		this.addNewColorEl = document.getElementById('addNewColor');

		//when "New Color" is pressed
		this.revealColorSelectEl.onclick = event => {
		    event.stopPropagation();
			this.redEl.value = 255*Math.random();
			this.greenEl.value = 255*Math.random();
			this.blueEl.value = 255*Math.random();
			this.changeColor();
			this.colorSelectEl.style.display = 'block';
		};

		//auto close 'new color panel' when click outside it
		window.onclick = event => this.colorSelectEl.style.display = 'none';

		//disable auto close on 'new color panel'
		this.colorSelectEl.onclick = function(event) {
			event.stopPropagation();
		};

		//When color sliders change
		this.redEl.oninput = event => this.changeColor();
		this.greenEl.oninput = event => this.changeColor();
		this.blueEl.oninput = event => this.changeColor();

		//When "Add Color" is pressed
		this.addNewColorEl.onclick = event => {
			this.addColor(newColor.style.backgroundColor);

			//Select the new color
			var aColorEl = this.colorsEl.getElementsByTagName('div');
			aColorEl[aColorEl.length-1].click();

			this.colorSelectEl.style.display = 'none';
			this.emit('onColorAdded');
		};

		this.loadFromLocalStorage();
	}

	getRGB(str){
	  var match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
	  return match ? {
	    r: match[1],
	    g: match[2],
	    b: match[3]
	  } : {};
	}

	selectColor(event){
		console.log(this.colorsEl);
		var aColorEl = this.colorsEl.getElementsByTagName('div');
		for (var i = 0; i < aColorEl.length; i++) {
			if(event.target==aColorEl[i]){
				aColorEl[i].className = 'color selected';
				window.color = this.getRGB(aColorEl[i].style.backgroundColor);
			}else{
				aColorEl[i].className = 'color';
			}
		}
	}

	addColor(value){
		var colorEl = document.createElement('div');
		colorEl.className = 'color';
		colorEl.style.backgroundColor = value;
		colorEl.onclick = event => this.selectColor.call(this, event);
		this.colorsEl.appendChild(colorEl);
		this.saveToLocalStorage();
	}

	loadFromLocalStorage(){
		var colorsJSON = localStorage.getItem('pixelBattleColors');
		var colors = JSON.parse(colorsJSON);
		if(Array.isArray(colors)){
			for(var i=0; i<colors.length; i++)
				this.addColor("rgb(" + colors[i].r + "," + colors[i].g + ", " + colors[i].b + ")");

			this.emit('onColorAdded');
		}else{
			//add default colors and select the first
			this.addColor('#fc4c4f');
			this.addColor('#4fa3fc');
			this.addColor('#ecd13f');
		}
		this.colorsEl.getElementsByTagName('div')[0].click();
	}
	
	saveToLocalStorage(){
		var colors = [];
		var colorDivs = this.colorsEl.getElementsByTagName('div');
		for(var i=0; i<colorDivs.length; i++){
			colors.push(this.getRGB(colorDivs[i].style.backgroundColor));
		}
		if(Array.isArray(colors)){
			localStorage.setItem('pixelBattleColors', JSON.stringify(colors));
		}
	}

	//update the new color span
	changeColor() {
		this.newColorEl.style.backgroundColor = "rgb(" + this.redEl.value + "," + this.greenEl.value + ", " + this.blueEl.value + ")";
	}
}

export default colorController