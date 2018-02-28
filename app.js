
const GW = 1050,
  GH = 800,
  EW = 75,
  EH = 156,
  ME = 9,
  PW = 75,
  PH = 54,
  PS = 0.75,
  r = Math.random,
  ro = Math.round;

a.width = GW;
a.height = GH;


const Circle = (loc) => ({
  x: loc.x + PW/2,
  y: loc.y + PH/2,
  radius: 2 + r()*5,
  vx: -5 + r()*10,
  vy: -5 + r()*10,
  r: ro(r())*255,
  g: ro(r())*255,
  b: ro(r())*255,
})

class Explosion {
  constructor(loc) {
    this.circles = [];
    this.loc = loc;
    for (let i = 0; i < 1000; i++) {
    	this.circles.push(Circle(loc));
    }
  }
  render() {
    c.shadowBlur = 2;
  	for (let j = 0; j < this.circles.length; j++){
  		let c = this.circles[j];
  		c.beginPath();
  		c.arc(c.x, c.y, c.radius, 0, Math.PI*2, false);
      c.fillStyle = "rgba("+c.r+", "+c.g+", "+c.b+", 0.9)";
  		c.fill();
  		c.x += c.vx;
  		c.y += c.vy;
  		c.radius -= .02;
  		if(c.radius < 2 + r()* 0.1) {
        (r() < 0.05)
        ? this.circles[j] = Circle(this.loc)
        : this.circles.splice(j, 1)
      }
  	}
  }
}

class Enemy {
  constructor(xPos, difficulty) {
    this.difficulty = difficulty;
    this.x = xPos;
    this.y = -EH;
    this.color = 'red';
    this.speed = (r() + 0.1) + this.difficulty/10000;
  }
  update(timeDiff) {
    this.y = this.y + timeDiff * this.speed;
    c.shadowBlur = 30;
    c.shadowColor = "black";
    c.fillStyle = this.color;
    c.fillRect(this.x, this.y, EW, EH);
  }
}


let
  enemies = [],
  score = 0,
  currentFrame,
  lastFrame = Date.now(),
  timeDiff,
  canStart = 1,
  explosion,
  player = {
    x: 5 * PW,
    y: GH - PH - 10,
    v:[0, 0, 0, 0],
    color: 'green',
    update: function() {
      let d = ([...this.v].reverse().findIndex(v => v!==0) !== this.v.findIndex(v => v!== 0)) ? 0.77 : 1;
      if (this.v[1] && this.x < GW - PW)
        this.x = this.x + (timeDiff*this.v[1]*PS * d);
      if (this.v[3] && this.x > 0)
        this.x = this.x - (timeDiff*this.v[3]*PS * d);
      if (this.v[0] && this.y > 0 + 10)
        this.y = this.y - (timeDiff*this.v[0]*PS * d);
      if (this.v[2] && this.y < GH - PH - 20)
        this.y = this.y + (timeDiff*this.v[2]*PS * d);
      c.shadowBlur = 30;
      c.shadowColor = "black";
      c.fillStyle = this.color;
      c.fillRect(this.x, this.y, PW, PH);
    }
  },
  drawBackground = () => {
    c.shadowBlur = 0;
    c.fillStyle = 'lightgrey';
    c.fillRect(0, 0, GW, GH);
  },
  drawText = t => {
    c.shadowBlur = 2;
    c.font = 'bold 30px Impact';
    c.fillStyle = '#ffffff';
    c.fillText(t, GW/2.5, GH/2);
  },
  drawScore = () => {
    c.fillStyle = '#ffffff';
    c.fillText(score, 5, 30);
  },
  isPlayerDead = () => enemies.some(e =>
    e.x < player.x + PW - 0.2 * PW &&
    e.x + EW > player.x + 0.2 * PW &&
    e.y + EH*0.8 > player.y &&
    e.y + EH*0.5 < player.y + PH
  ),
  start = () => {
    enemies = [];
    player = {
      ...player,
      x: 5 * PW,
      y: GH - PH - 10,
      v:[0, 0, 0, 0],
    };
    canStart = 0;
    score = 0;
    lastFrame = Date.now();
    gameLoop();
  },
  explosionLoop = () => {
    timeDiff = Date.now() - lastFrame;
    updateEnemies();
    explosion.render();
    drawText('GAME OVER - press enter to play again');
    drawScore();
    lastFrame = Date.now();
    canStart ? requestAnimationFrame(explosionLoop) : 0;
  },
  gameLoop = () => {
    timeDiff = Date.now() - lastFrame;
    score += ro(timeDiff/10);
    drawBackground();
    while (enemies.filter(e => !!e).length < ME) {addEnemy()};
    updateEnemies();
    lastFrame = Date.now();
    drawScore();
    if (isPlayerDead()) {
      explosion = new Explosion({ x: player.x, y: player.y });
      canStart = 1;
      explosionLoop()
    } else {
      player.update(timeDiff);
      requestAnimationFrame(gameLoop);
    }
  },
  updateEnemies = () => enemies.forEach((e, id) => e.y > GH ? delete enemies[id] : e.update(timeDiff)),
  addEnemy = () => enemies.push(new Enemy(Math.floor(r() * (GW - EW + 1)), score));

onkeydown = ({ keyCode: k }) => {
  k == 13 && canStart && start();
  let a = k==38? 0 : k==39? 1 : k==40? 2 : k==37? 3 : -1;
  a > -1 ? player.v[a] = 1 : 0;
};


onkeyup = ({ keyCode: k }) => {
  let aa = k==38? 0 : k==39? 1 : k==40? 2 : k==37? 3 : -1;
  aa > -1 ? player.v[aa] = 0 : 0;
};

drawBackground();
player.update();
drawText('Press Enter to play');
