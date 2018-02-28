let
  m = Math,
  r = m.random,
  ro = m.round,
  circles,
  enemies = [],
  score = 0,
  canStart = 1,
  k = [0],
  x,
  y,
  Enemy = () => ({
    x: m.floor(r() * (1006)),
    y: -156,
    speed: (r() + 0.1) / 5 + score / 1e5,
    update: function () {
      this.y = this.y + this.speed;
      fS('#d01');
      c.fillRect(this.x, this.y, 75, 156);
    }
  }),
  shadowBlur = blur => c.shadowBlur = blur,
  updateExplosion = () => {
    shadowBlur(0);
    for (i = 0; i < circles.length; i++) {
      let q = circles[i];
      c.beginPath();
      c.arc(q.x, q.y, q.radius, 0, m.PI * 2, false);
      fS(`rgba(${q.r}, ${q.g}, ${q.b}, 0.9)`);
      c.fill();
      q.x += q.vx;
      q.y += q.vy;
      q.radius -= .02;
      if (q.radius < 2 + r() * 0.1) r() < 0.05 ? circles[i] = Circle(x, y) : circles.splice(i, 1);
    };
    drawText('GAME OVER - press enter');
  },
  fS = o => c.fillStyle = o,
  Circle = () => ({
    x: x + 37,
    y: y + 27,
    radius: 2 + r() * 5,
    vx: -5 + r() * 10,
    vy: -5 + r() * 10,
    r: ro(r()) * 255,
    g: ro(r()) * 255,
    b: ro(r()) * 255,
  }),
  drawText = t => {
    shadowBlur(2);
    c.font = 'bold 30px Impact';
    fS('#fff');
    c.fillText(t, 432, 400);
  },
  drawBackground = () => {
    fS('#ccc');
    c.fillRect(0, 0, 1080, 800);
  },
  start = () => {
    enemies = [];
    circles = [];
    canStart = 0;
    score = 0;
    x = 370;
    y = 680,
  };

onkeydown = ({which:w}) => w == 13 && canStart ? start() : k[w]=1;
onkeyup = x => k[x.which]=0;
a.height = 800;
a.width= 1080;
c.shadowColor = "#000";

drawBackground();
drawText('Press Enter');

setInterval(() => { // game loop
  !canStart ? (() => {
    score += 1;
    drawBackground();
    !enemies[8] ? enemies.push(Enemy()) : 0;

    let s = (k.reduce((acc, z) => z + acc) > 1 ? 0.4 : 0.5);
    (k[39] && x < 1006) ? x += s : (k[37] && x > 0) ? x -= s : 0;
    (k[38] && y > 10) ? y -= s : (k[40] && y < 726) ? y += s : 0;
    fS('#1cb');
    c.fillRect(x, y, 74, 54);

    if (enemies.some(e =>
      e.x < x + 60 &&
      e.x + 75 > x + 14 &&
      e.y + 124 > y &&
      e.y + 78 < y + 54
    )) {
      circles = [...Array(700)].map(Circle);
      canStart = 1;
    }
  })() : updateExplosion();
  shadowBlur(30);
  enemies.forEach((e, i) => e.y > 800 ? enemies.splice(i, 1) : e.update());
  fS('#fff');
  c.fillText(ro(score / 10), 5, 30);
}, 50);
