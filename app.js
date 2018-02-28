let
  m = Math,
  r = m.random,
  ro = m.round,
  enemies = circles = [],
  score = x = y = 0,
  canStart = 1,
  k = [0],
  s = 0.5,
  Enemy = () => ({
    x: m.floor(r()*(1006)),
    y:-156,
    speed: (r() + 0.1)/5 + score/1e5,
    update: function(){
      this.y = this.y + this.speed;
      fS('#d01');
      c.fillRect(this.x, this.y, 75, 156);
    }
  }),
  shadowBlur = blur => c.shadowBlur = blur,
  fS = o => c.fillStyle = o,
  Circle = () => [
    x + 37,
    y + 27,
    2 + r()*5,
    -5 + r()*10,
    -5 + r()*10,
    ro(r())*255,
    ro(r())*255,
    ro(r())*255,
  ],
  drawText = t => {
    shadowBlur(2);
    c.font = 'bold 30px Impact';
    fS('#fff');
    c.fillText(t, 432, 400);
  },
  start = () => {
    canStart = score = 0;
    enemies = [];
    x = 370;
    y = 680,
    gameLoop();
  },
  gameLoop = () => {
    if(!canStart) {
      score += 1;

      // set background
      fS('#ccc');
      c.fillRect(0, 0, 1080, 800);

      // fill enemies
      !enemies[8] ? enemies.push(Enemy()) : 0;

      // change the player's coords
      (k[39] && x < 1006) ? x+=s: (k[37] && x > 0) ? x-=s : 0;
      (k[38] && y > 10) ? y-=s : (k[40] && y < 726) ? y+=s : 0;
      fS('#1cb');
      c.fillRect(x, y, 74, 54);

      // detect collision
      if(enemies.some(e =>
        e.x < x + 60 &&
        e.x + 75 > x + 14 &&
        e.y + 124 > y &&
        e.y + 78 < y + 54
      )) {
        circles = [...Array(700)].map(Circle);
        canStart = 1;
      }
    } else {
      shadowBlur(0);
      for (i = 0; i < circles.length; i++){
        let q = circles[i];
        c.beginPath();
        c.arc(q[0], q[1], q[2], 0, m.PI*2, false);
        fS(`rgba(${q[5]}, ${q[6]}, ${q[7]}, 0.9)`);
        c.fill();
        q[0] += q[3];
        q[1] += q[4];
        q[2] -= .02;
        if(q[2] < 2 + r()*0.1) r() < 0.05 ? circles[i] = Circle(x,y) : circles.splice(i, 1);
      };
      drawText('GAME OVER - press enter');
    }
    shadowBlur(30);
    enemies.forEach((e, i) => e.y > 800 ? enemies.splice(i,1) : e.update());
    fS('#fff');
    c.fillText(ro(score/10), 5, 30);
    setInterval(gameLoop,50)
  };

onkeydown = ({which:w}) => w == 13 && canStart ? start() : k[w]=1;
onkeyup = x => k[x.which]=0;
a.height = 800;
a.width= 1080;
c.shadowColor = "#000";

drawText('Press Enter');



