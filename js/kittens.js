// This sectin contains some game constants. It is not super interesting
const GAME_WIDTH = 1050;
const GAME_HEIGHT = 800;

const ENEMY_WIDTH = 75;
const ENEMY_HEIGHT = 156;
const MAX_ENEMIES = 9;

const PLAYER_WIDTH = 75;
const PLAYER_HEIGHT = 54;

// These two constants keep us from using "magic numbers" in our code
const LEFT_ARROW_CODE = 37;
const RIGHT_ARROW_CODE = 39;
const UP_ARROW_CODE = 38;
const DOWN_ARROW_CODE = 40;
const ENTER_KEY = 13;

// These two constants allow us to DRY
const MOVE_LEFT = 'left';
const MOVE_RIGHT = 'right';
const MOVE_UP = 'up';
const MOVE_DOWN = 'down';

const PLAYER_SPEED = 0.75;

var highscoresRef = firebase.database().ref('highscores')
var highscoresArray = [];

fetchHighscores();

function fetchHighscores() {
  highscoresRef.orderByChild("score").limitToLast(10).once('value').then(highscores => {
    var highscoresNode = document.getElementById("highscores");
    while (highscoresNode.firstChild) {
      highscoresNode.removeChild(highscoresNode.firstChild);
    }
    highscores.forEach(hs => {
      highscoresArray.push(hs.val().score);
      prependChild(highscoresNode, createScoreNode(hs.val()));
    })
  })
}

highscoresRef.on('child_added', function(highscores) {
  fetchHighscores()
});

function prependChild(parent, newFirstChild) {
    parent.insertBefore(newFirstChild, parent.firstChild)
}

function createScoreNode(scoreObj) {
  var newDiv = document.createElement("div");
  var userName = document.createElement("p");
  var score = document.createElement("p");
  
  userName.appendChild(document.createTextNode(scoreObj.username));
  score.appendChild(document.createTextNode(scoreObj.score));
  
  newDiv.appendChild(userName);
  newDiv.appendChild(score);
  
  return newDiv;
}

// Preload game images
var images = {};
['enemy.png', 'stars.jpg', 'player.png'].forEach(imgName => {
    var img = document.createElement('img');
    img.src = 'images/' + imgName;
    images[imgName] = img;
});

function saveHighscore(score) {
  var username = window.prompt("You got a highscore, please enter your name!")
  if (username != null) {
    highscoresRef.push({
      username: username,
      score: score
    });
  }
}


class Circle {
  constructor(location) {
    this.x = location.x + PLAYER_WIDTH/2;
  	this.y = location.y + PLAYER_HEIGHT/2;
  	//Random radius between 2 and 6
  	this.radius = 2 + Math.random()*5;
  	//Random velocities
  	this.vx = -5 + Math.random()*10;
  	this.vy = -5 + Math.random()*10;
  	//Random colors
  	this.r = Math.round(Math.random())*255;
  	this.g = Math.round(Math.random())*255;
  	this.b = Math.round(Math.random())*255;
  }
}

class Explosion {
  constructor(location, ctx) {
    this.ctx = ctx;
    this.circles = [];
    this.location = location;
    for (var i = 0; i < 1000; i++) {
    	this.circles.push(new Circle(location));
    }
  }
  
  render() {
  	//Fill the canvas with circles
  	for(var j = 0; j < this.circles.length; j++){
  		var c = this.circles[j];
  		
  		//Create the circles
  		this.ctx.beginPath();
  		this.ctx.arc(c.x, c.y, c.radius, 0, Math.PI*2, false);
      this.ctx.fillStyle = "rgba("+c.r+", "+c.g+", "+c.b+", 0.9)";
  		this.ctx.fill();
  		
  		c.x += c.vx;
  		c.y += c.vy;
  		c.radius -= .02;
  		
  		if(c.radius < 2 + Math.random()* 0.1) {
        if (Math.random() < 0.05) {
          this.circles[j] = new Circle(this.location)
        }
        else {
          this.circles.splice(j, 1);
        }
      }
      
  	}
  }
  
}


// This section is where you will be doing most of your coding
class Entity {
  render(ctx) {
      ctx.drawImage(this.sprite, this.x, this.y);
  }
}

class Enemy extends Entity {
    constructor(xPos, difficulty) {
        super()
        this.difficulty = difficulty
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.sprite = images['enemy.png'];

        // Each enemy should have a different speed
        this.speed = (Math.random() + 0.1) + this.difficulty/10000// 2 + 0.25;
    }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    }
}

class Player extends Entity {
    constructor() {
        super()
        this.x = 5 * PLAYER_WIDTH;
        this.y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
        this.sprite = images['player.png'];
        this.velocity = [0, 0, 0, 0];
    }
    
    update(timeDiff) {
      console.log(timeDiff)
      var diagonal = _.findLastIndex(this.velocity, v => v!==0) !== _.findIndex(this.velocity, v => v!== 0)
      if (this.velocity[1] && this.x < GAME_WIDTH - PLAYER_WIDTH) {
        this.x = this.x + (timeDiff*this.velocity[1]*PLAYER_SPEED * (diagonal?0.77:1));
      }
      if (this.velocity[3] && this.x > 0) {
        this.x = this.x - (timeDiff*this.velocity[3]*PLAYER_SPEED * (diagonal?0.77:1));
      }
      if (this.velocity[0] && this.y > 0 + 10) {
        this.y = this.y - (timeDiff*this.velocity[0]*PLAYER_SPEED * (diagonal?0.77:1));
      }
      if (this.velocity[2] && this.y < GAME_HEIGHT - PLAYER_HEIGHT - 20) {
        this.y = this.y + (timeDiff*this.velocity[2]*PLAYER_SPEED * (diagonal?0.77:1));
      }
    }

    // This method is called by the game engine when left/right arrows are pressed
    // move(direction) {
    //     if (direction === MOVE_LEFT && this.x > 0) {
    //         this.x = this.x - 10;
    //     }
    //     else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
    //         this.x = this.x + 10;
    //     }
    // }

}


/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {
    constructor(element) {
        // Setup the player
        this.player = new Player();
        
        this.canStart = true
        this.score = 1;

        // Setup enemies, making sure there are always three
        this.setupEnemies();
        
        // Event Listeners
        document.addEventListener('keypress', e => {
          if (e.keyCode === ENTER_KEY && this.canStart) {
            this.start()
          }
        })
        document.addEventListener('keydown', e => {
          if (e.keyCode === UP_ARROW_CODE) {
            this.player.velocity[0] = 1;
          }
          if (e.keyCode === RIGHT_ARROW_CODE) {
            this.player.velocity[1] = 1;
          }
          if (e.keyCode === DOWN_ARROW_CODE) {
            this.player.velocity[2] = 1;
          }
          if (e.keyCode === LEFT_ARROW_CODE) {
            this.player.velocity[3] = 1;
          }
        })
        document.addEventListener('keyup', e => {
          if (e.keyCode === UP_ARROW_CODE) {
            this.player.velocity[0] = 0;
          }
          if (e.keyCode === RIGHT_ARROW_CODE) {
            this.player.velocity[1] = 0;
          }
          if (e.keyCode === DOWN_ARROW_CODE) {
            this.player.velocity[2] = 0;
          }
          if (e.keyCode === LEFT_ARROW_CODE) {
            this.player.velocity[3] = 0;
          }
        })

        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement('canvas');
        canvas.id = "canvas";
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        element.appendChild(canvas);

        this.ctx = canvas.getContext('2d');

        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
    }

    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
    setupEnemies() {
        if (!this.enemies) {
            this.enemies = [];
        }

        while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
            this.addEnemy();
        }
    }

    // This method finds a random spot where there is no enemy, and puts one in there
    addEnemy() {
        var enemySpots = GAME_WIDTH / ENEMY_WIDTH;

        this.enemies.push(new Enemy(Math.floor(Math.random() * (GAME_WIDTH - ENEMY_WIDTH + 1)), this.score))
        // var enemySpot;
        // Keep looping until we find a free enemy spot at random
        // || this.enemies[enemySpot]
        // while (enemySpot===undefined ) {
        //     enemySpot = Math.floor(Math.random() * enemySpots);
        // }
        // var firstEmptySlot = this.enemies.findIndex(e=>!e)
        // if (firstEmptySlot >= 0) {
        //   this.enemies[firstEmptySlot] = new Enemy(enemySpot * ENEMY_WIDTH, this.score);
        // }
        // else {
        //   this.enemies.push(new Enemy(enemySpot * ENEMY_WIDTH, this.score))
        // }
        
    }

    // This method kicks off the game
    start() {
        this.enemies = [];
        this.player.x = 5 * PLAYER_WIDTH;
        this.player.y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
        this.canStart = false
        this.score = 0;
        this.lastFrame = Date.now();

        this.gameLoop();
    }
    
    loadGameStartScreen() {
      this.ctx.drawImage(images['stars.jpg'], 0, 0)
      this.player.render(this.ctx);
      this.ctx.font = 'bold 30px Impact';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText('Press Enter to play', GAME_WIDTH/2.5, GAME_HEIGHT/2);
      requestAnimationFrame(()=>this.loadGameStartScreen())
    }
    
    explodePlayer() {
      var oldX = this.player.x;
      var oldY = this.player.y;
      this.player.x = -1000;
      this.player.y = -1000;
      
      this.explosion = new Explosion({ x: oldX, y: oldY }, this.ctx);
      this.explosionLoop();
    }
    
    explosionLoop() {
      // Check how long it's been since last frame
      var currentFrame = Date.now();
      var timeDiff = currentFrame - this.lastFrame;
      
      // Call update on all enemies
      this.enemies.forEach(enemy => enemy.update(timeDiff));

      // Draw everything!
      this.ctx.drawImage(images['stars.jpg'], 0, 0); // draw the star bg
      this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
      this.player.render(this.ctx); // draw the player
      this.explosion.render();
      
      this.ctx.font = 'bold 30px Impact';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(this.score, 5, 30);
      this.ctx.fillText('GAME OVER - press enter to play again', GAME_WIDTH/3.3, GAME_HEIGHT/2);
      
      // Check if any enemies should die
      this.enemies.forEach((enemy, enemyIdx) => {
          if (enemy.y > GAME_HEIGHT) {
              delete this.enemies[enemyIdx];
          }
      });
      // this.setupEnemies();
      if (this.canStart) {
        this.lastFrame = Date.now();
        requestAnimationFrame(()=>this.explosionLoop())
      }
      
    }

    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
    gameLoop() {
        // Check how long it's been since last frame
        var currentFrame = Date.now();
        var timeDiff = currentFrame - this.lastFrame;

        // Increase the score!
        this.score += Math.round(timeDiff/10);

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff));
        
        // Update player
        this.player.update(timeDiff)

        // Draw everything!
        this.ctx.drawImage(images['stars.jpg'], 0, 0); // draw the star bg
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
        this.player.render(this.ctx); // draw the player
        
        // Check if any enemies should die
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT) {
                delete this.enemies[enemyIdx];
            }
        });
        
        this.setupEnemies();
        // Check if player is dead
        if (this.isPlayerDead()) {
          // If they are dead, then it's game over!
          this.canStart = true;
          this.explodePlayer()
          if (this.score > highscoresArray[0]) {
            saveHighscore(this.score)
          }
        }
        else {
            // If player is not dead, then draw the score
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = "start";
            this.ctx.fillText(this.score, 5, 30);

            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    isPlayerDead() {
        for (var i = 0; i < this.enemies.length; i++) {
            // check if enemy overlaps with player
            if (this.enemies[i]
                && this.enemies[i].x < this.player.x + PLAYER_WIDTH - 0.2 * PLAYER_WIDTH
                && this.enemies[i].x + ENEMY_WIDTH > this.player.x + 0.2 * PLAYER_WIDTH
                && this.enemies[i].y + ENEMY_HEIGHT*0.6 > this.player.y
                && this.enemies[i].y + ENEMY_HEIGHT*0.5 < this.player.y + PLAYER_HEIGHT
            ) {
                return true
            }
        }
        return false;
    }
    
    detectCollision(entity1, entity2) {
      
    }
}


// This section will start the game
var gameEngine = new Engine(document.getElementById('app'));
gameEngine.loadGameStartScreen();
