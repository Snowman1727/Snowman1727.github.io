import { projectGround } from './cat-ground.js';
import { createPixelCatSprites, paintPixelCat } from './pixel-cat.js';

export const sceneSize = { width: 600, height: 420 };

function polygon(ctx, points, color) {
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function makeGround() {
  const base = document.createElement('canvas');
  base.width = 1200;
  base.height = 840;
  const ctx = base.getContext('2d');
  ctx.scale(2, 2);
  const top = [[300,146],[542,238],[300,330],[58,238]];
  polygon(ctx, [[58,238],[300,330],[300,359],[58,267]], '#345b50');
  polygon(ctx, [[300,330],[542,238],[542,267],[300,359]], '#25453e');
  polygon(ctx, [[58,238],[300,330],[300,337],[58,245]], '#9bbfaf');
  polygon(ctx, [[300,330],[542,238],[542,245],[300,337]], '#759f8b');
  polygon(ctx, top, '#d5e4d7');
  polygon(ctx, [[300,153],[526,239],[300,323],[74,239]], '#80a897');

  ctx.save();
  ctx.beginPath();
  top.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
  ctx.closePath();
  ctx.clip();
  for (let i = 0; i < 86; i++) {
    const x = 60 + (i * 137 % 480);
    const y = 153 + (i * 53 % 175);
    ctx.fillStyle = i % 3 ? '#92b5a144' : '#5e8b7744';
    ctx.fillRect(x, y, 4 + i % 4 * 3, 2);
  }
  ctx.strokeStyle = '#4d7c682b';
  ctx.lineWidth = 1;
  for (const at of [0.25, 0.5, 0.75]) {
    for (const [start, end] of [
      [projectGround({ u: at, v: 0 }), projectGround({ u: at, v: 1 })],
      [projectGround({ u: 0, v: at }), projectGround({ u: 1, v: at })],
    ]) {
      ctx.beginPath();
      ctx.moveTo(start.x,start.y);
      ctx.lineTo(end.x,end.y);
      ctx.stroke();
    }
  }
  polygon(ctx, [[265,160],[300,146],[379,176],[358,185],[328,183],[322,190],[301,184],[288,185],[288,174],[267,173]], '#dce9e0');
  polygon(ctx, [[58,238],[98,223],[117,229],[115,237],[143,241],[145,248],[129,254],[105,250],[93,252]], '#deebe1');
  polygon(ctx, [[467,211],[489,218],[492,225],[518,228],[542,238],[510,250],[483,246],[486,237],[467,232]], '#d8e8dd');
  polygon(ctx, [[270,319],[282,309],[299,311],[312,305],[330,310],[328,319],[300,330]], '#cbded1');
  ctx.restore();
  ctx.strokeStyle = '#acccbc';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(58,238);
  ctx.lineTo(300,146);
  ctx.lineTo(542,238);
  ctx.stroke();
  for (let i = 0; i < 14; i++) {
    const t = (i + 0.5) / 14;
    const point = projectGround({ u: t, v: 1 });
    ctx.fillStyle = i % 2 ? '#719782' : '#4a725e';
    ctx.fillRect(Math.round(point.x), Math.round(point.y + 14), 6, 3);
  }
  return base;
}

export function createCatScene(canvas) {
  const ctx = canvas.getContext('2d');
  const ground = makeGround();
  const sprites = createPixelCatSprites();
  return (position, gaze, facing, phase) => {
    const feet = projectGround(position);
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.clearRect(0, 0, sceneSize.width, sceneSize.height);
    ctx.drawImage(ground, 0, 0, sceneSize.width, sceneSize.height);
    polygon(ctx, [
      [feet.x - 42,feet.y - 2],[feet.x - 30,feet.y - 9],
      [feet.x + 27,feet.y - 9],[feet.x + 43,feet.y - 2],
      [feet.x + 29,feet.y + 5],[feet.x - 29,feet.y + 5],
    ], '#244f414a');
    paintPixelCat(ctx, sprites, feet, gaze, facing, phase);
  };
}
