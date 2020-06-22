function rand(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function endMessage(moves) {
  makeVisable("end-Message");  
}

function makeVisable(id) {
  if (document.getElementById(id).style.visibility == "visible") {
    document.getElementById(id).style.visibility = "hidden";
  } else {
    document.getElementById(id).style.visibility = "visible";
  }
}

function Maze(Width, Height) {
  var mazeMap;
  var width = Width;
  var height = Height;
  var startCoordinate, endCoordinate;
  var directions = ["n", "s", "e", "w"];
  var modifiedDirections = {
    n: {
      y: -1,
      x: 0,
      o: "s"
    },
    s: {
      y: 1,
      x: 0,
      o: "n"
    },
    e: {
      y: 0,
      x: 1,
      o: "w"
    },
    w: {
      y: 0,
      x: -1,
      o: "e"
    }
  };

  this.map = function() {
    return mazeMap;
  };
  this.startCoordinate = function() {
    return startCoordinate;
  };
  this.endCoordinate = function() {
    return endCoordinate;
  };

  function makeMap() {
    mazeMap = new Array(height);
    for (y = 0; y < height; y++) {
      mazeMap[y] = new Array(width);
      for (x = 0; x < width; ++x) {
        mazeMap[y][x] = {
          n: false,
          s: false,
          e: false,
          w: false,
          visited: false,
          previousPosition: null
        };
      }
    }
  }

  function defineMaze() {
    var isCompleted = false;
    var move = false;
    var cellsVisited = 1;
    var numberLoops = 0;
    var maximumLoops = 0;
    var position = {
      x: 0,
      y: 0
    };
    var numberCells = width * height;
    while (!isCompleted) {
      move = false;
      mazeMap[position.x][position.y].visited = true;

      if (numberLoops >= maximumLoops) {
        shuffle(directions);
        maximumLoops = Math.round(rand(height / 8));
        numberLoops = 0;
      }
      numberLoops++;
      for (index = 0; index < directions.length; index++) {
        var direction = directions[index];
        var n_x = position.x + modifiedDirections[direction].x;
        var n_y = position.y + modifiedDirections[direction].y;

        if (n_x >= 0 && n_x < width && n_y >= 0 && n_y < height) {
          if (!mazeMap[n_x][n_y].visited) {
            mazeMap[position.x][position.y][direction] = true;
            mazeMap[n_x][n_y][modifiedDirections[direction].o] = true;

            mazeMap[n_x][n_y].previousPosition = position;
            position = {
              x: n_x,
              y: n_y
            };
            cellsVisited++;
            move = true;
            break;
          }
        }
      }

      if (!move) {
        position = mazeMap[position.x][position.y].previousPosition;
      }
      if (numberCells == cellsVisited) {
        isCompleted = true;
      }
    }
  }

  function defineStartEnd() {
    switch (rand(4)) {
      case 0:
        startCoordinate = {
          x: 0,
          y: 0
        };
        endCoordinate = {
          x: height - 1,
          y: width - 1
        };
        break;
      case 1:
        startCoordinate = {
          x: 0,
          y: width - 1
        };
        endCoordinate = {
          x: height - 1,
          y: 0
        };
        break;
      case 2:
        startCoordinate = {
          x: height - 1,
          y: 0
        };
        endCoordinate = {
          x: 0,
          y: width - 1
        };
        break;
      case 3:
        startCoordinate = {
          x: height - 1,
          y: width - 1
        };
        endCoordinate = {
          x: 0,
          y: 0
        };
        break;
    }
  }

  makeMap();
  defineStartEnd();
  defineMaze();
}

function DrawMaze(Maze, context, cellsize, endSprite = null) {
  var map = Maze.map();
  var cell_Size = cellsize;
  var drawEnd;
  context.lineWidth = cell_Size / 40;

  this.redrawMaze = function(size) {
    cell_Size = size;
    context.lineWidth = cell_Size / 50;
    drawMap();
    drawEnd();
  };

  function drawCell(xCord, yCord, cell) {
    var x = xCord * cell_Size;
    var y = yCord * cell_Size;

    if (cell.n == false) {
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + cell_Size, y);
      context.strokeStyle = "#FFFFFF";
      context.stroke();
    }
    if (cell.s === false) {
      context.beginPath();
      context.moveTo(x, y + cell_Size);
      context.lineTo(x + cell_Size, y + cell_Size);
      context.strokeStyle = "#FFFFFF";
      context.stroke();
    }
    if (cell.e === false) {
      context.beginPath();
      context.moveTo(x + cell_Size, y);
      context.lineTo(x + cell_Size, y + cell_Size);
      context.strokeStyle = "#FFFFFF";
      context.stroke();
    }
    if (cell.w === false) {
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x, y + cell_Size);
      context.strokeStyle = "#FFFFFF";
      context.stroke();
    }
  }

  function drawMap() {
    for (x = 0; x < map.length; x++) {
      for (y = 0; y < map[x].length; y++) {
        drawCell(x, y, map[x][y]);
      }
    }
  }

  function drawEndFlag() {
    var coord = Maze.endCoordinate();
    var gridSize = 4;
    var fraction = cell_Size / gridSize - 2;
    var changeColor = true;
    for (let y = 0; y < gridSize; y++) {
      if (gridSize % 2 == 0) {
        changeColor = !changeColor;
      }
      for (let x = 0; x < gridSize; x++) {
        context.beginPath();
        context.rect(
          coord.x * cell_Size + x * fraction + 4.5,
          coord.y * cell_Size + y * fraction + 4.5,
          fraction,
          fraction
        );
        if (changeColor) {
          context.fillStyle = "rgba(0, 0, 0, 0.8)";
        } else {
          context.fillStyle = "rgba(255, 255, 255, 0.8)";
        }
        context.fill();
        changeColor = !changeColor;
      }
    }
  }

  function drawBall() {
    var offLeft = cell_Size / 50;
    var offRight = cell_Size / 25;
    var coord = Maze.endCoordinate();
    context.drawImage(
      endSprite,
      2,
      2,
      endSprite.width,
      endSprite.height,
      coord.x * cell_Size + offLeft,
      coord.y * cell_Size + offLeft,
      cell_Size - offRight,
      cell_Size - offRight
    );
  }

  function clear() {
    var canvasSize = cell_Size * map.length;
    context.clearRect(0, 0, canvasSize, canvasSize);
  }

  if (endSprite != null) {
    drawEnd = drawBall;
  } else {
    drawEnd = drawEndFlag;
  }
  clear();
  drawMap();
  drawEnd();
}

function Player(maze, c, _cellsize, onComplete, dog = null) {
  var context = c.getContext("2d");
  var drawIcons;
  var moves = 0;
  drawIcons = drawIconsCircle;
  if (dog != null) {
    drawIcons = drawImage;
  }
  var player = this;
  var map = maze.map();
  var cellCoords = {
    x: maze.startCoordinate().x,
    y: maze.startCoordinate().y
  };
  var cell_Size = _cellsize;
  var halfCellSize = cell_Size / 2;

  this.redrawPlayer = function(_cellsize) {
    cell_Size = _cellsize;
    drawImage(cellCoords);
  };

  function drawIconsCircle(coord) {
    context.beginPath();
    context.fillStyle = "yellow";
    context.arc(
      (coord.x + 1) * cell_Size - halfCellSize,
      (coord.y + 1) * cell_Size - halfCellSize,
      halfCellSize - 2,
      0,
      2 * Math.PI
    );
    context.fill();
    if (coord.x === maze.endCoordinate().x && coord.y === maze.endCoordinate().y) {
      onComplete(moves);
      player.unbindKeyDown();
    }
  }

  function drawImage(coord) {
    var offsetLeft = cell_Size / 50;
    var offsetRight = cell_Size / 25;
    context.drawImage(
      dog,
      0,
      0,
      dog.width,
      dog.height,
      coord.x * cell_Size + offsetLeft,
      coord.y * cell_Size + offsetLeft,
      cell_Size - offsetRight,
      cell_Size - offsetRight
    );
    if (coord.x === maze.endCoordinate().x && coord.y === maze.endCoordinate().y) {
      onComplete(moves);
      player.unbindKeyDown();
    }
  }

  function removeSprite(coord) {
    var offsetLeft = cell_Size / 50;
    var offsetRight = cell_Size / 25;
    context.clearRect(
      coord.x * cell_Size + offsetLeft,
      coord.y * cell_Size + offsetLeft,
      cell_Size - offsetRight,
      cell_Size - offsetRight
    );
  }

  function check(e) {
    var cell = map[cellCoords.x][cellCoords.y];
    moves++;
    //console.log(moves);
    switch (e.keyCode) {
      case 65:
      case 37: // west
        if (cell.w == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x - 1,
            y: cellCoords.y
          };
          drawIcons(cellCoords);
        }
        break;
      case 87:
      case 38: // north
        if (cell.n == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x,
            y: cellCoords.y - 1
          };
          drawIcons(cellCoords);
        }
        break;
      case 68:
      case 39: // east
        if (cell.e == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x + 1,
            y: cellCoords.y
          };
          drawIcons(cellCoords);
        }
        break;
      case 83:
      case 40: // south
        if (cell.s == true) {
          removeSprite(cellCoords);
          cellCoords = {
            x: cellCoords.x,
            y: cellCoords.y + 1
          };
          drawIcons(cellCoords);
        }
        break;
    }
  }

  this.bindKeyDown = function() {
    window.addEventListener("keydown", check, false);

    $("#view").swipe({
      swipe: function(
        event,
        direction,
        distance,
        duration,
        fingerCount,
        fingerData
      ) {
        console.log(direction);
        switch (direction) {
          case "up":
            check({
              keyCode: 38
            });
            break;
          case "down":
            check({
              keyCode: 40
            });
            break;
          case "left":
            check({
              keyCode: 37
            });
            break;
          case "right":
            check({
              keyCode: 39
            });
            break;
        }
      },
      threshold: 0
    });
  };

  this.unbindKeyDown = function() {
    window.removeEventListener("keydown", check, false);
    $("#view").swipe("destroy");
  };

  drawIcons(maze.startCoordinate());

  this.bindKeyDown();
}

var mazeCanvas = document.getElementById("mazeCanvas");
var context = mazeCanvas.getContext("2d");
var dog;
var ball;
var maze, draw, player;
var cell_Size;
var difficulty;

window.onload = function() {
  let viewWidth = $("#view").width();
  let viewHeight = $("#view").height();
  if (viewHeight < viewWidth) {
    context.canvas.width = viewHeight - viewHeight / 100;
    context.canvas.height = viewHeight - viewHeight / 100;
  } else {
    context.canvas.width = viewWidth - viewWidth / 100;
    context.canvas.height = viewWidth - viewWidth / 100;
  }

  var completeOne = false;
  var completeTwo = false;
  var isComplete = () => {
    if(completeOne === true && completeTwo === true)
       {
         console.log("Runs");
         setTimeout(function(){
           makeMaze();
         }, 500);         
       }
  };
  dog = new Image();
  dog.src = "img/dog.png";
  dog.onload = function() {
    completeOne = true;
    console.log(completeOne);
    isComplete();
  };

  ball = new Image();
  ball.src = "img/ball.png";
  ball.onload = function() {
    completeTwo = true;
    console.log(completeTwo);
    isComplete();
  };
  
};

window.onresize = function() {
  let viewWidth = $("#view").width();
  let viewHeight = $("#view").height();
  if (viewHeight < viewWidth) {
    context.canvas.width = viewHeight - viewHeight / 100;
    context.canvas.height = viewHeight - viewHeight / 100;
  } else {
    context.canvas.width = viewWidth - viewWidth / 100;
    context.canvas.height = viewWidth - viewWidth / 100;
  }
  cell_Size = mazeCanvas.width / difficulty;
  if (player != null) {
    draw.redrawMaze(cell_Size);
    player.redrawPlayer(cell_Size);
  }
};

function makeMaze() {
  if (player != undefined) {
    player.unbindKeyDown();
    player = null;
  }
  var hardness = document.getElementById("difficultyOption");
  difficulty = hardness.options[hardness.selectedIndex].value;
  cell_Size = mazeCanvas.width / difficulty;
  maze = new Maze(difficulty, difficulty);
  draw = new DrawMaze(maze, context, cell_Size, ball);
  player = new Player(maze, mazeCanvas, cell_Size, endMessage, dog);
  if (document.getElementById("mazeContainer").style.opacity < "100") {
    document.getElementById("mazeContainer").style.opacity = "100";
  }
}