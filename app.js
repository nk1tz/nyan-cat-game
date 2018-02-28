
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

class Circle {
  constructor(loc) {
    this.x = loc.x + PW/2;
    this.y = loc.y + PH/2;
  	this.radius = 2 + r()*5;
  	this.vx = -5 + r()*10;
  	this.vy = -5 + r()*10;
  	this.r = ro(r())*255;
  	this.g = ro(r())*255;
  	this.b = ro(r())*255;
  }
}

class Explosion {
  constructor(loc, ctx) {
    this.ctx = ctx;
    this.circles = [];
    this.loc = loc;
    for (let i = 0; i < 1000; i++) {
    	this.circles.push(new Circle(loc));
    }
  }
  render() {
    this.ctx.shadowBlur = 2;
  	for (let j = 0; j < this.circles.length; j++){
  		let c = this.circles[j];
  		this.ctx.beginPath();
  		this.ctx.arc(c.x, c.y, c.radius, 0, Math.PI*2, false);
      this.ctx.fillStyle = "rgba("+c.r+", "+c.g+", "+c.b+", 0.9)";
  		this.ctx.fill();
  		c.x += c.vx;
  		c.y += c.vy;
  		c.radius -= .02;
  		if(c.radius < 2 + r()* 0.1) {
        (r() < 0.05)
        ? this.circles[j] = new Circle(this.loc)
        : this.circles.splice(j, 1)
      }
  	}
  }
}

class Enemy {
  constructor(xPos, difficulty, ctx) {
    this.difficulty = difficulty;
    this.x = xPos;
    this.y = -EH;
    this.color = 'red';
    this.ctx = ctx;
    this.speed = (r() + 0.1) + this.difficulty/10000;
  }
  update(timeDiff) {
    this.y = this.y + timeDiff * this.speed;
    this.ctx.shadowBlur = 30;
    this.ctx.shadowColor = "black";
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, EW, EH);
  }
}


let enemies = [],
  score = 0,
  currentFrame,
  lastFrame = Date.now(),
  timeDiff,
  ctx = a.getContext('2d'),
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
      ctx.shadowBlur = 30;
      ctx.shadowColor = "black";
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, PW, PH);
    }
  },
  drawBackground = () => {
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'lightgrey';
    ctx.fillRect(0, 0, GW, GH);
  },
  drawText = t => {
    ctx.shadowBlur = 2;
    ctx.font = 'bold 30px Impact';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(t, GW/2.5, GH/2);
  },
  drawScore = () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillText(score, 5, 30);
  },
  isPlayerDead = () => {
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i]
        && enemies[i].x < player.x + PW - 0.2 * PW
        && enemies[i].x + EW > player.x + 0.2 * PW
        && enemies[i].y + EH*0.8 > player.y
        && enemies[i].y + EH*0.5 < player.y + PH
      ) return true;
    }
    return 0
  },
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
      explosion = new Explosion({ x: player.x, y: player.y }, ctx);
      canStart = 1;
      explosionLoop()
    } else {
      player.update(timeDiff);
      requestAnimationFrame(gameLoop);
    }
  },
  updateEnemies = () => enemies.forEach((e, id) => e.y > GH ? delete enemies[id] : e.update(timeDiff)),
  addEnemy = () => enemies.push(new Enemy(Math.floor(r() * (GW - EW + 1)), score, ctx));

onkeydown = ({ keyCode: k }) => {
  let a = k==38? 0 : k==39? 1 : k==40? 2 : k==37? 3 : -1;
  a > -1 ? player.v[a] = 1 : 0;
};

onkeypress = ({ keyCode: k }) => {
  k == 13 && canStart ? start() : 0;
};

onkeyup = ({ keyCode: k }) => {
  let aa = k==38? 0 : k==39? 1 : k==40? 2 : k==37? 3 : -1;
  aa > -1 ? player.v[aa] = 0 : 0;
};

drawBackground();
player.update();
drawText('Press Enter to play');
