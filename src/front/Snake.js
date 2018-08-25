//code imported from @sacert
//https://github.com/sacert/Snake-Star

class Node{
	constructor(x, y) {
		this.block = false;
		this.x = x;  
		this.y = y;
		this.parent = null;
		this.gScore = -1; // score of getting from start to this node
		this.fScore = -1; // score of gScore plus hueristic value
		this.heuristicCalc = function (x_final, y_final) {
			return Math.floor(Math.abs(x_final - this.x) + Math.abs(y_final - this.y));
		};
	}
}

class SnakeLoader {
	constructor(width, height, size){
		this.w = width;
		this.h = height;
		this.ROWS = size;
		this.COLS = size;
		this.BLOCK_W = Math.floor(this.w/ this.COLS);
		this.BLOCK_H = Math.floor(this.h / this.ROWS);
		this.gameOver = false;

		// size of grid nxn
		this.size = this.ROWS;
		  
		// initialize grid of size 10
		this.grid_aStar = this.grid(this.size);
		  
		// starting values 
		this.start_x = Math.floor(this.ROWS/2);
		this.start_y = Math.floor(this.COLS/2);

		// get the starting point of the item (apple)  
		var tries = 0;
		do {
		  this.item_x = Math.floor(Math.random() * this.size);
		  this.item_y = Math.floor(Math.random() * this.size);
		  tries++;
		} while (this.grid_aStar[this.item_y][this.item_x].block == true && tries < 50)


		// array for where the elements of the snake will be
		this.snake = new Array();
		this.snake.push(this.grid_aStar[this.start_y][this.start_x]);
		this.grid_aStar[this.start_y][this.start_x].block = true;
	}

	// create 2D grid of of nxn where n = size
	grid(size) {
	  // create array 
	  var grid = new Array(size);
	  for (var i = 0; i < size; i++) {
		grid[i] = new Array(size);
	  }
	  
	  // associate each element with a node object
	  for (var i = 0; i < size; i++) {
		for (var j = 0; j < size; j++) {
		  if(grid[i][j] != "-") {
			grid[i][j] = new Node(j, i);
		  }
		}
	  }
	  
	  return grid;
	}

	// checks to see if the currentNode should be looked at
	inBoundsCheck(currentNode, i, j) {
		// out of bounds
		if (((currentNode.x + j) < 0) || ((currentNode.x + j) > this.size - 1) || ((currentNode.y + i) < 0) || ((currentNode.y + i) > this.size - 1)) {
			return false;
		}

		// check to see if block is within the grid
		if ((this.grid_aStar[currentNode.y + i][currentNode.x + j].block)) {
			return false;
		}

		// skip the current node
		if ((currentNode.y + i == currentNode.y && currentNode.x + j == currentNode.x)
			|| ((i == -1) && (j == -1)) || ((i == -1) && (j == 1))
			|| ((i == 1) && (j == -1)) || ((i == 1) && (j == 1))) {
			return false;
		}

		// if it passed all possible checks
		return true;
	}


	A_Star() {
	  // ending values 
	  var end_x = this.item_x;
	  var end_y = this.item_y;
	  
	  // set of nodes that have already been looked at
	  var closedSet = [];
	  
	  // set of nodes that are known but not looked at 
	  var openSet = [];

	  // add the starting element to the open set
	  openSet.push(this.grid_aStar[this.start_y][this.start_x]);
	  this.grid_aStar[this.start_y][this.start_x].gScore = 0;
	  this.grid_aStar[this.start_y][this.start_x].fScore = this.grid_aStar[this.start_y][this.start_x].heuristicCalc(end_x, end_y); // just the heuristic

	  // while open set is not empty
	  while (openSet.length > 0) {
	  	var lowest = 0;
	  	var lowestValue = 99999;
	  	for(var i=0; i<openSet.length; i++){
	  		if(openSet[i].fScore<lowestValue){
	  			lowestValue = openSet[i].fScore;
	  			lowest = i;
	  		}
	  	}
		var currentNode = openSet[lowest];
		
		if ((currentNode.x == end_x) && (currentNode.y == end_y)) {
		  return this.reconstruct_path(this.grid_aStar, currentNode, this.start_x, this.start_y); // return path
		}
		
		// remove current node from open set
		var index = openSet.indexOf(currentNode);
		openSet.splice(index, 1);
		
		closedSet.push(currentNode);
		
		// looking at all of the node's neighbours
		for (var i = -1; i < 2; i++) {
		  for (var j = -1; j < 2; j++) {

			if (!this.inBoundsCheck(currentNode, i, j)) {
				continue;
			}

			var neighbour = this.grid_aStar[currentNode.y + i][currentNode.x + j];
			
			// if node is within the closed set, it has already
			// been looked at - therefore skip it
			if (closedSet.indexOf(neighbour) != -1) {
			  continue;
			}
			
			// set tentative score to gScore plus distance from current to neighbour
			// in this case, the weight is equal to 1 everywhere
			var tScore = neighbour.gScore + 1;
			
			// if neighbour is not in open set, add it
			if (openSet.indexOf(neighbour) == -1) {
			  openSet.push(neighbour);
			}
			
			// this is a better path so set node's new values
			neighbour.parent = currentNode;
			neighbour.gScore = tScore;
			neighbour.fScore = neighbour.gScore + neighbour.heuristicCalc(end_x, end_y);
			
		  }
		}
	  }
	  
	  // the node was not found or could not be reached
	  return false;
	  
	}

	reconstruct_path(grid_aStar, current, start_x, start_y) {
		var currentNode = current;
		var totalPath = [current];
		
		// go through the parents to find how the route
		while (currentNode.parent != null) {
		  totalPath.push(currentNode.parent);
		  currentNode = currentNode.parent;
		}
		
		return totalPath;
	}

	// draws the board and the moving shape
	draw(context) {
		
		if (!this.gameOver) {
			context.clearRect(0, 0, this.w, this.h);
			for (var x = 0; x < this.COLS; ++x) {
				for (var y = 0; y < this.ROWS; ++y) {

					if (((y == this.item_y) && (x == this.item_x))) {
						//fruit
						context.fillStyle = "red";
						context.fillRect(this.BLOCK_W * x  , this.BLOCK_H * y, this.BLOCK_W , this.BLOCK_H);
					} else if (this.grid_aStar[y][x].block) {
						//snake
						context.fillStyle = "white";
						context.fillRect(this.BLOCK_W * x  , this.BLOCK_H * y, this.BLOCK_W , this.BLOCK_H);
					} else {
						//empty
					}
				}
			}
		}
	}

	// get the next node for the snake to move
	getNextMove(end_x, end_y) {
		var nextLoc;
		var lowestfScore = -1;
		var lowestfScoreNode = null;
		for (var i = -1; i < 2; i++) {
			for (var j = -1; j < 2; j++) {

				if (!this.inBoundsCheck(this.snake[0], i, j)) {
					continue;
				}

				var neighbour = this.grid_aStar[this.snake[0].y + i][this.snake[0].x + j];

				// pathScore = fScore + pathLength
				var pathScore = neighbour.gScore + neighbour.heuristicCalc(end_x, end_y) + this.pathLength(neighbour) + 1;

				// find the largest pathScore
				if (pathScore > lowestfScore) {
					lowestfScore = pathScore;
					lowestfScoreNode = neighbour;
				}
			}
		}

		return lowestfScoreNode;
	}

	// determine how many spaces are available to move given the currentNode
	pathLength(currentNode) {

		var currNode = currentNode;
		var numOfNodes = 0;

		var longestPathArray = new Array();

		for (var i = -1; i < 2; i++) {
			for (var j = -1; j < 2; j++) {
			
				if (!this.inBoundsCheck(currNode, i, j)) {
					continue;
				}

				currNode = this.grid_aStar[currNode.y + i][currNode.x + j];

				// increment the number of nodes and reset the check to looking at the top node
				numOfNodes++;
				i = -1;
				j = -1;

				longestPathArray.push(currNode);
				
				// check if no where else to go
				if ((!((currNode.x + 1) >= 0 && (currNode.x + 1) < this.size) || this.grid_aStar[currNode.y][currNode.x + 1] == undefined || this.grid_aStar[currNode.y][currNode.x + 1].block)
					&& (!((currNode.x - 1) >= 0 && (currNode.x - 1) < this.size) || this.grid_aStar[currNode.y][currNode.x - 1] == undefined || this.grid_aStar[currNode.y][currNode.x - 1].block)
					&& (!((currNode.y + 1) >= 0 && (currNode.y + 1) < this.size) || this.grid_aStar[currNode.y + 1][currNode.x] == undefined || this.grid_aStar[currNode.y + 1][currNode.x].block)
					&& (!((currNode.y - 1) >= 0 && (currNode.y - 1) < this.size) || this.grid_aStar[currNode.y - 1][currNode.x] == undefined || this.grid_aStar[currNode.y - 1][currNode.x].block)) {

					// house keeping - reset blocks to false
					for (var i = 0; i < longestPathArray.length - 1; i++) {
						longestPathArray[i].block = false;
					}

					return numOfNodes;
				}
				currNode.block = true;
			}
		}
	}


	update() {

		// keep track of where the trail is
		var tail;

		if (!this.gameOver) {

			var path = this.A_Star();

			// clear the grid to perform the next set of calculations
			for (var j = 0; j < path.length - 1; j++) {
				path[j].parent = null;
				path[j].gScore = -1;
				path[j].fScore = -1;
			}

			for (var i = 0; i < this.grid_aStar.length; i++) {
				for (var j = 0; j < this.grid_aStar.length; j++) {
					this.grid_aStar[i][j].parent = null;
					this.grid_aStar[i][j].gScore = -1;
					this.grid_aStar[i][j].fScore = -1;
				}
			}

			// if there is a path using A* to the item, go to the first node
			var nextLoc;
			if (path) {
				if(path.length>=2)
					nextLoc = path[path.length - 2];
				else
					nextLoc = path[path.length - 1]; 
			} else { // otherwise, attempt to find the next best movement
				var nextNode = this.getNextMove(this.item_x, this.item_y);
				if (nextNode == null) {
					this.gameOver = true;
					//console.log("Game Over");
					return;
				} else {
					nextLoc = nextNode;
				}
			}

			// set next location
			this.snake.unshift(nextLoc) 
			nextLoc.block = true;
			this.start_x = nextLoc.x;
			this.start_y = nextLoc.y;

			// if not at the item, pop the tail
			if (!((nextLoc.x == this.item_x) && (nextLoc.y == this.item_y))) {
				tail = this.snake.pop();
				tail.block = false;
				tail.gScore = -1;
				tail.fScore = -1;
			} else { // if at the item, set a new item location
				var tries = 0;
				do {
					this.item_x = Math.floor(Math.random() * this.ROWS);
					this.item_y = Math.floor(Math.random() * this.ROWS);
					tries++;
				} while (this.grid_aStar[this.item_y][this.item_x].block == true && tries < 50)
			}
		}
	}
}

export default SnakeLoader