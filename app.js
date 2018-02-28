let GW = 1050,
  GH = 800,
  EW = 75,
  EH = 156,
  ME = 9,
  PW = 75,
  PH = 54,
  PS = 0.75,
  r = Math.random,
  ro = Math.round,
  i;

  a.width = GW;
  a.height = GH;

  const Circle = loc => ({
    x: loc.x + PW/2,
    y: loc.y + PH/2,
    radius: 2 + r()*5,
    vx: -5 + r()*10,
    vy: -5 + r()*10,
    r: ro(r())*255,
    g: ro(r())*255,
    b: ro(r())*255,
  })

function Explosion(loc) {
  this.circles = [];
  this.loc = loc;
  for (i = 0; i < 1000; i++) {
    this.circles.push(Circle(loc));
  }
  this.render = function() {
    shadowBlur(2);
  	for (i = 0; i < this.circles.length; i++){
  		let circ = this.circles[i];
  		c.beginPath();
  		c.arc(circ.x, circ.y, circ.radius, 0, Math.PI*2, false);
      c.fillStyle = "rgba("+circ.r+", "+circ.g+", "+circ.b+", 0.9)";
  		c.fill();
  		circ.x += circ.vx;
  		circ.y += circ.vy;
  		circ.radius -= .02;
  		if(circ.radius < 2 + r()* 0.1) {
        (r() < 0.05)
        ? this.circles[i] = Circle(this.loc)
        : this.circles.splice(i, 1)
      }
  	}
  }
}

function Enemy(xPos, diff) {
  this.diff = diff;
  this.x = xPos;
  this.y = -EH;
  this.speed = (r() + 0.1) + diff/10000;
  this.update = function(timeDiff) {
    this.y = this.y + timeDiff * this.speed;
    shadowBlur(30);
    c.shadowColor = "#000";
    c.fillStyle = 'red';
    c.fillRect(this.x, this.y, EW, EH);
  }
}

let enemies = [],
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
    update: function() {
      let { x, y, v } = this;
      let d = v.reduce((acc, z) => z+acc) > 1 ? 0.77 : 1;
      (v[1] && x < GW - PW)
      ? this.x = x + (timeDiff*v[1]*PS * d)
      : (v[3] && x > 0)
      ? this.x = x - (timeDiff*v[3]*PS * d)
      : 0;
      (v[0] && y > 0 + 10)
      ? this.y = y - (timeDiff*v[0]*PS * d)
      : (v[2] && y < GH - PH - 20)
      ? this.y = y + (timeDiff*v[2]*PS * d)
      : 0;
      shadowBlur(30);
      c.shadowColor = "#000";
      c.fillStyle = 'green';
      c.fillRect(x, y, PW, PH);
    }
  },
  drawBackground = () => {
    shadowBlur(0);
    c.fillStyle = 'lightgrey';
    c.fillRect(0, 0, GW, GH);
  },
  drawText = t => {
    shadowBlur(2);
    c.font = 'bold 30px Impact';
    c.fillStyle = '#fff';
    c.fillText(t, GW/2.5, GH/2);
  },
  drawScore = () => {
    c.fillStyle = '#fff';
    c.fillText(score, 5, 30);
  },
  shadowBlur = blur => c.shadowBlur = blur,
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
  updateTimeDiff = () => timeDiff = Date.now() - lastFrame,
  explosionLoop = () => {
    updateTimeDiff();
    updateEnemies();
    explosion.render();
    drawText('GAME OVER - press enter');
    drawScore();
    lastFrame = Date.now();
    canStart ? requestAnimationFrame(explosionLoop) : 0;
  },
  gameLoop = () => {
    updateTimeDiff();
    score += ro(timeDiff/10);
    drawBackground();
    while (enemies.filter(e => !!e).length < ME) {addEnemy()};
    updateEnemies();
    lastFrame = Date.now();
    drawScore();
    if (isPlayerDead()) {
      explosion = new Explosion({ x: player.x, y: player.y }, c);
      canStart = 1;
      explosionLoop()
    } else {
      player.update(timeDiff);
      requestAnimationFrame(gameLoop);
    }
  },
  updateEnemies = () => enemies.forEach((e, id) => e.y > GH ? delete enemies[id] : e.update(timeDiff)),
  addEnemy = () => enemies.push(new Enemy(Math.floor(r() * (GW - EW + 1)), score, c));

onkeydown = ({ keyCode: k }) => {
  let dir = k==38? 0 : k==39? 1 : k==40? 2 : k==37? 3 : -1;
  dir > -1 ? player.v[dir] = 1 : 0;
};

onkeypress = ({ keyCode: k }) => {
  k == 13 && canStart ? start() : 0;
};

onkeyup = ({ keyCode: k }) => {
  let dir = k==38? 0 : k==39? 1 : k==40? 2 : k==37? 3 : -1;
  dir > -1 ? player.v[dir] = 0 : 0;
};

drawBackground();
player.update();
drawText('Press Enter');
