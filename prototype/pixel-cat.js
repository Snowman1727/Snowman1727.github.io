function random(seed) {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function makeSprite(phase = -1) {
  const small = document.createElement('canvas');
  small.width = 100;
  small.height = 70;
  const p = small.getContext('2d', { willReadFrequently: true });
  const fill = (d, color) => { p.fillStyle = color; p.fill(new Path2D(d)); };
  const walking = phase >= 0;
  const bob = walking && phase % 2 ? -1 : 0;
  fill('M64 51H72V48H75V38H73V34H77V36H79V47H77V52H74V55H64Z', '#b18a53');
  fill('M66 50H72V47H74V39H77V47H75V51H71V53H66Z', '#e4bc77');
  fill('M36 43H63V46H66V50H68V57H65V60H33V58H31V50H33V46H36Z', '#bc955c');
  fill('M39 44H60V49H63V55H60V59H37V55H35V49H39Z', '#dab77a');
  fill('M42 46H57V51H60V56H57V59H40V55H39V50H42Z', '#f0d7a6');
  p.save();
  p.translate(0, bob);
  fill('M29 25V16H31V13H34V15H36V18H40V20H60V18H63V15H66V13H69V16H71V25H73V29H75V37H73V41H69V44H64V46H36V44H30V42H27V38H25V30H27V25Z', '#bd955d');
  fill('M31 26V17H33V16H34V20H39V23H61V21H65V17H67V20H69V28H72V32H73V37H70V40H66V42H35V41H30V38H28V31H30V26Z', '#dfbd80');
  fill('M31 21V17H33V18H35V22H33V24H31Z M65 22V18H67V24H65Z', '#cba391');
  fill('M29 36H35V38H43V37H57V38H65V36H72V39H68V42H63V44H36V42H31V40H29Z', '#f0d9ad');
  const rng = random(92);
  for (let i = 0; i < 240; i++) {
    const x = 26 + Math.floor(rng() * 49);
    const y = 14 + Math.floor(rng() * 33);
    if (!p.getImageData(x, y + bob, 1, 1).data[3]) continue;
    p.fillStyle = rng() > 0.3 ? '#f3dba7' : '#b8925b';
    p.globalAlpha = 0.23 + rng() * 0.2;
    p.fillRect(x, y, 1, rng() > 0.6 ? 2 : 1);
  }
  p.globalAlpha = 1;
  p.fillStyle = '#ddbc81';
  for (const [x,y] of [[27,28],[25,32],[26,37],[28,40],[30,43],[35,45],[64,45],[69,43],[73,40],[75,34],[72,26],[39,19],[59,19]]) p.fillRect(x,y,1,1);
  p.fillStyle = '#a87d64';
  p.fillRect(49,36,3,1);
  p.fillRect(50,37,1,1);
  p.fillStyle = '#806b50';
  p.fillRect(50,38,1,2);
  p.fillRect(48,39,2,1);
  p.fillRect(51,39,2,1);
  p.restore();
  if (walking) {
    p.clearRect(28, 57, 43, 7);
    const step = [0, 1, 0, -1][phase];
    p.fillStyle = '#b48d58';
    p.fillRect(34 - step, 55, 7, phase % 2 ? 5 : 6);
    p.fillRect(61 + step, 55, 7, phase % 2 ? 6 : 5);
    p.fillStyle = '#e0c18c';
    p.fillRect(40 + step, 54, 7, phase % 2 ? 7 : 6);
    p.fillRect(54 - step, 54, 7, phase % 2 ? 6 : 7);
    p.fillStyle = '#f1dcb3';
    p.fillRect(39 + step, phase % 2 ? 59 : 58, 8, 2);
    p.fillRect(54 - step, phase % 2 ? 58 : 59, 8, 2);
  } else {
    fill('M34 57H40V61H32V59H34Z M59 57H65V59H67V61H59Z', '#ecd3a2');
    p.fillStyle = '#ddbc81';
    p.fillRect(35,58,1,1);
    p.fillRect(63,58,1,1);
  }
  return small;
}

export function createPixelCatSprites() {
  return { idle: makeSprite(), walk: Array.from({ length: 4 }, (_, i) => makeSprite(i)) };
}

export function paintPixelCat(ctx, sprites, feet, gaze, facing, phase) {
  const scale = 2.6;
  const bob = phase >= 0 && phase % 2 ? -1 : 0;
  const mirror = facing > 0 ? -1 : 1;
  ctx.save();
  ctx.translate(Math.round(feet.x), Math.round(feet.y));
  ctx.scale(mirror * scale, scale);
  ctx.translate(-50, -61);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(phase < 0 ? sprites.idle : sprites.walk[phase], 0, 0);
  const dx = Math.round(gaze.x / 4) * mirror;
  const dy = Math.round(gaze.y / 3);
  for (const x of [39.5, 60.5]) {
    ctx.fillStyle = '#6e7950';
    ctx.fillRect(x - 2.5, 30 + bob, 5, 7);
    ctx.fillStyle = '#343d2f';
    ctx.fillRect(x - 2.5, 30 + bob, 5, 1);
    ctx.fillStyle = '#302f29';
    ctx.fillRect(x - 1.5 + dx, 32 + dy + bob, 3, 4);
    ctx.fillStyle = '#ffefd0';
    ctx.fillRect(x - 1.5 + dx, 32 + dy + bob, 1, 1);
  }
  ctx.restore();
}
