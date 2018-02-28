let GW = 1050,
  GH = 800,
  EW = 75,
  EH = 156,
  m = Math,
  r = m.random,
  ro = m.round,
  Circle = (x,y) => ({
    x: x + 74/2,
    y: y + 54/2,
    radius: 2 + r()*5,
    vx: -5 + r()*10,
    vy: -5 + r()*10,
    r: ro(r())*255,
    g: ro(r())*255,
    b: ro(r())*255,
  }),
  fS = o => c.fillStyle = o,
  enemies = [],
  score = 0,
  date = Date.now,
  lastFrame = date(),
  timeDiff,
  canStart = 1,
  k = [0],
  x = 370,
  y = GH - 64,
  updatePlayer = () => {
    let s = timeDiff*(k.reduce((acc, z) => z+acc) > 1 ? 0.58 : 0.77);
    (k[39] && x < GW - 74)
    ? x += s
    : (k[37] && x > 0)
    ? x -= s
    : 0;
    (k[38] && y > 10)
    ? y -= s
    : (k[40] && y < GH - 74)
    ? y += s
    : 0;
    shadowBlur(30);
    fS('#1cb');
    c.fillRect(x, y, 74, 54);
  },
  drawBackground = () => {
    shadowBlur(0);
    fS('#ccc');
    c.fillRect(0, 0, GW, GH);
  },
  drawText = t => {
    shadowBlur(2);
    c.font = 'bold 30px Impact';
    fS('#fff');
    c.fillText(t, GW/2.5, GH/2);
  },
  drawScore = () => {
    fS('#fff');
    c.fillText(score, 5, 30);
  },
  shadowBlur = blur => c.shadowBlur = blur,
  isPlayerDead = () => enemies.some(e =>
    e.x < x + 60 &&
    e.x + EW > x + 14 &&
    e.y + EH*0.8 > y &&
    e.y + EH*0.5 < y + 54
  ),
  start = () => {
    enemies = [];
    canStart = 0;
    score = 0;
    lastFrame = date();
    gameLoop();
  },
  updateTimeDiff = () => timeDiff = date() - lastFrame,
  explosionLoop = () => {
    updateTimeDiff();
    updateEnemies();
    explosion.render();
    drawText('GAME OVER - press enter');
    drawScore();
    lastFrame = date();
    canStart ? requestAnimationFrame(explosionLoop) : 0;
  },
  gameLoop = () => {
    updateTimeDiff();
    score += ro(timeDiff/10);
    drawBackground();
    if (!enemies[8]) addEnemy();
    updateEnemies();
    lastFrame = date();
    drawScore();
    if (isPlayerDead()) {
      explosion = new Explosion;
      canStart = 1;
      explosionLoop()
    } else {
      updatePlayer();
      requestAnimationFrame(gameLoop);
    }
  },
  updateEnemies = () => enemies.forEach((e, i) => e.y > GH ? enemies.splice(i,1) : e.update(timeDiff)),
  addEnemy = () => enemies.push(new Enemy(m.floor(r() * (GW - EW + 1)), score));

function Explosion() {
  let circles = [];
  for (i = 0; i < 1000; i++) {
    circles.push(Circle(x,y));
  }
  this.render = () => {
    shadowBlur(2);
  	for (i = 0; i < circles.length; i++){
  		let circ = circles[i];
  		c.beginPath();
      c.arc(circ.x, circ.y, circ.radius, 0, m.PI*2, false);
      fS(`rgba(${circ.r}, ${circ.g}, ${circ.b}, 0.9)`);
  		c.fill();
  		circ.x += circ.vx;
  		circ.y += circ.vy;
  		circ.radius -= .02;
  		if(circ.radius < 2 + r()* 0.1)
        r() < 0.05 ? circles[i] = Circle(x,y) : circles.splice(i, 1)
  	}
  }
}
function Enemy(xPos, diff) {
  this.x = xPos;
  this.y = -EH;
  this.speed = (r() + 0.1) + diff/10000;
  this.update = function(timeDiff) {
    this.y = this.y + timeDiff * this.speed;
    shadowBlur(30);
    fS('#d01');
    c.fillRect(this.x, this.y, EW, EH);
  }
}
onkeydown = ({which:w}) => w == 13 && canStart ? start() : k[w]=1;
onkeyup = x => k[x.which]=0;
a.width = GW;
a.height = GH;
c.shadowColor = "#000";
drawBackground();
updatePlayer();
drawText('Press Enter');
