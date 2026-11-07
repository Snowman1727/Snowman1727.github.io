import { createPixelCatSprites } from './pixel-cat.js';

const W = 400;
const H = 280;

function random(seed) {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function oval(ctx, x, y, rx, ry, color) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function stroke(ctx, d, color, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke(new Path2D(d));
}

// Short strokes inside the silhouette and along its contour make fur, not spikes.
function fur(ctx, d, color, bounds, { seed = 1, length = 3, density = 1400, pencil = false } = {}) {
  const rng = random(seed);
  const path = new Path2D(d);
  const [x, y, width, height] = bounds;
  ctx.fillStyle = color;
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  ctx.lineCap = 'round';
  for (let i = 0; i < density; i++) {
    const px = x + rng() * width;
    const py = y + rng() * height;
    const direction = Math.atan2((py - y - height * 0.35) * 0.7, (px - x - width * 0.5) * 0.5);
    const span = pencil ? 0.9 + rng() * length : 0.6 + rng() * length * 0.65;
    const dx = Math.cos(direction) * span;
    const dy = Math.sin(direction) * span;
    ctx.strokeStyle = rng() > 0.28 ? `rgba(255,244,213,${0.06 + rng() * 0.12})` : `rgba(113,79,45,${0.025 + rng() * 0.065})`;
    ctx.lineWidth = pencil ? 0.35 + rng() * 0.55 : 0.45 + rng() * 0.5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.quadraticCurveTo(px + dx * 0.65 - dy * 0.12, py + dy * 0.65, px + dx, py + dy);
    ctx.stroke();
  }
  ctx.restore();
  const contour = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  contour.setAttribute('d', d);
  const total = contour.getTotalLength();
  for (let at = 0; at < total; at += 0.7 + rng() * 0.8) {
    const point = contour.getPointAtLength(at);
    const next = contour.getPointAtLength(Math.min(total, at + 0.5));
    const tangent = Math.atan2(next.y - point.y, next.x - point.x);
    let nx = Math.sin(tangent);
    let ny = -Math.cos(tangent);
    if (nx * (point.x - x - width / 2) + ny * (point.y - y - height / 2) < 0) { nx *= -1; ny *= -1; }
    const span = pencil ? 0.8 + rng() * length * 0.75 : 0.6 + rng() * length * 0.5;
    ctx.strokeStyle = rng() > 0.3 ? color : 'rgba(255,226,171,0.65)';
    ctx.lineWidth = 0.4 + rng() * 0.65;
    ctx.beginPath();
    ctx.moveTo(point.x - nx * 1.8, point.y - ny * 1.8);
    ctx.quadraticCurveTo(point.x + nx * span * 0.6, point.y + ny * span * 0.6, point.x + nx * span - ny * 0.7, point.y + ny * span + nx * 0.7);
    ctx.stroke();
  }
}

function nose(ctx, x, y, scale = 1, color = '#b98577') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.fill(new Path2D('M-3.8-1.7 Q0-3.4 3.8-1.7 Q4.4-.1 1 2.5 Q0 3.3-1 2.5 Q-4.4-.1-3.8-1.7'));
  stroke(ctx, 'M0 2.7 V6 M0 6 Q-3.7 10-6.2 6.5 M0 6 Q3.7 10 6.2 6.5', '#715d4d', 0.9);
  ctx.restore();
}

function dumpling(ctx) {
  fur(ctx, 'M270 207 C309 217 338 198 326 171 C322 161 311 163 313 175 C318 194 297 192 280 183Z', '#c99a5a', [268,160,63,53], { seed: 4, length: 3.5, density: 750 });
  fur(ctx, 'M95 215 C72 207 79 180 99 166 C116 154 140 158 154 165 C191 143 237 150 270 167 C295 180 306 209 280 221 C231 238 135 234 95 215Z', '#ddba7c', [78,150,223,83], { seed: 6, length: 4, density: 2400 });
  fur(ctx, 'M122 113 Q118 96 130 83 L132 62 Q133 52 141 58 L164 79 Q192 68 221 80 L242 59 Q251 53 252 63 L251 99 C269 118 269 147 255 167 C240 189 216 194 191 193 C161 197 134 186 121 169 C107 152 109 126 122 113Z', '#e9c992', [109,55,159,141], { seed: 17, length: 3.8, density: 3100 });
  fur(ctx, 'M134 81 L136 63 Q146 66 155 81Z', '#d9aaa0', [132,61,25,23], { seed: 9, length: 1.2, density: 170 });
  fur(ctx, 'M229 81 L247 63 L247 91Z', '#d9aaa0', [228,62,22,30], { seed: 8, length: 1.2, density: 170 });
  fur(ctx, 'M143 154 C155 145 173 151 190 156 C211 147 234 150 246 162 C240 184 216 188 192 187 C169 187 149 177 143 154Z', '#f6e5c4', [140,148,109,41], { seed: 22, length: 2.5, density: 1000 });
  fur(ctx, 'M135 213 C139 204 159 205 169 213 Q175 224 155 226 Q132 227 135 213Z', '#f5e3c0', [133,204,40,24], { seed: 25, length: 2.1, density: 350 });
  fur(ctx, 'M232 213 C238 205 255 207 261 215 Q265 226 245 226 Q228 225 232 213Z', '#f5e3c0', [229,204,36,23], { seed: 29, length: 2.1, density: 350 });
  nose(ctx, 193, 158, 0.85);
  stroke(ctx, 'M149 220 V223 M156 220 V224 M243 220 V224 M250 220 V224', '#c7ad87', 0.7);
}

function peeking(ctx) {
  fur(ctx, 'M145 203 C145 173 252 172 256 203 L256 224 L145 224Z', '#ca9c63', [141,177,119,49], { seed: 42, length: 4, density: 1000 });
  fur(ctx, 'M111 134 Q108 111 123 97 L121 66 Q122 53 133 60 L164 83 Q198 73 232 83 L263 61 Q274 53 274 66 L270 105 C289 123 292 148 280 169 C289 178 272 183 271 188 C255 211 229 218 199 215 C164 218 139 209 123 190 L109 185 L114 174 Q96 161 104 144Z', '#dbb77e', [101,57,188,164], { seed: 41, length: 5.4, density: 4200 });
  fur(ctx, 'M128 91 L127 66 Q143 72 151 86Z', '#cda19b', [124,64,30,30], { seed: 43, length: 2, density: 250 });
  fur(ctx, 'M246 87 L268 65 L266 97Z', '#cda19b', [243,62,28,39], { seed: 44, length: 2, density: 250 });
  fur(ctx, 'M130 162 Q151 151 172 166 Q199 176 224 165 Q248 152 271 166 C264 195 233 209 200 208 C168 210 139 195 130 162Z', '#f1dfbf', [128,155,145,57], { seed: 45, length: 4, density: 1900 });
  nose(ctx, 200, 169, 1);
  stroke(ctx, 'M130 171 L112 170 M131 177 L110 180 M266 172 L286 169 M266 180 L287 183', '#b69978', 0.7);
  stroke(ctx, 'M56 226 H344', '#81bfa9', 1.3);
  fur(ctx, 'M133 218 C136 207 158 205 169 216 L173 231 C174 244 134 244 130 233Z', '#f0dcb6', [128,206,47,38], { seed: 49, length: 3.5, density: 650 });
  fur(ctx, 'M232 215 C243 204 264 209 267 220 L271 233 C265 245 232 243 230 231Z', '#f0dcb6', [227,206,47,39], { seed: 50, length: 3.5, density: 650 });
  stroke(ctx, 'M145 231 V236 M155 231 V236 M244 231 V236 M254 231 V236', '#c5a980', 0.8);
}

function storybook(ctx) {
  const pencil = { pencil: true, length: 5.8 };
  fur(ctx, 'M139 180 C145 154 166 143 194 144 C223 143 250 156 264 178 C277 201 265 220 240 227 L167 227 C140 226 130 204 139 180Z', '#d2aa71', [132,140,139,91], { ...pencil, seed: 63, density: 2400 });
  fur(ctx, 'M148 171 C160 159 184 164 193 185 Q193 211 167 220 L144 208Z', '#efe0bd', [141,160,56,63], { ...pencil, seed: 65, density: 900 });
  fur(ctx, 'M101 121 Q100 103 113 96 L112 75 Q112 66 121 72 L142 87 Q164 79 183 91 L201 75 Q209 70 209 80 L203 109 C219 131 212 155 196 170 C175 188 140 184 116 170 C98 157 92 139 101 121Z', '#e3bd80', [94,68,120,119], { ...pencil, seed: 66, density: 2600 });
  fur(ctx, 'M118 94 L117 77 L134 89Z', '#cfaaa0', [114,73,24,25], { seed: 67, length: 2, density: 200 });
  fur(ctx, 'M190 96 L204 80 L201 105Z', '#cfaaa0', [187,78,20,30], { seed: 68, length: 2, density: 200 });
  fur(ctx, 'M111 144 Q134 138 149 151 Q167 140 195 143 C195 168 176 178 153 176 C134 176 118 166 111 144Z', '#f2e5ca', [108,139,91,40], { ...pencil, seed: 69, density: 900 });
  fur(ctx, 'M255 174 C287 185 295 207 279 224 C260 245 211 246 179 234 C163 229 165 213 179 212 C199 214 211 222 235 216 C256 214 263 207 248 198Z', '#cda368', [164,170,126,75], { ...pencil, seed: 70, density: 2100 });
  fur(ctx, 'M260 205 Q270 214 256 223 Q239 231 215 230 C205 228 206 220 220 219 Q248 219 253 209Z', '#e6c591', [206,203,67,30], { ...pencil, seed: 71, density: 650 });
  fur(ctx, 'M121 216 Q128 207 142 213 Q157 220 145 228 Q128 234 119 224Z', '#eddbb7', [117,208,35,23], { ...pencil, seed: 73, density: 450 });
  nose(ctx, 149, 152, 0.8, '#a97966');
  stroke(ctx, 'M117 154 L102 153 M118 160 L102 164 M187 154 L204 150', '#ae9070', 0.6);
  stroke(ctx, 'M125 234 Q173 243 209 241 M227 243 Q261 241 276 235', '#8caa91', 0.7);
}

function pixel(ctx) {
  const { idle } = createPixelCatSprites();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(idle, 0, 0, W, H);
}

export const studies = [
  { id: 'a', name: '软团子猫', draw: dumpling, eyes: [{x:164,y:140},{x:222,y:140}], eyeWidth: 8.4, eyeHeight: 10.5, pupil: 4.8 },
  { id: 'b', name: '像素小居民', draw: pixel, eyes: [{x:158,y:132},{x:242,y:132}], pixel: true },
  { id: 'c', name: '探头小猫', draw: peeking, eyes: [{x:166,y:149},{x:234,y:149}], eyeWidth: 9.5, eyeHeight: 12, pupil: 5.5 },
  { id: 'd', name: '绘本小猫', draw: storybook, eyes: [{x:128,y:133},{x:174,y:132}], eyeWidth: 7.3, eyeHeight: 9, pupil: 4.3 },
];

export function prepareStudy(study) {
  const base = document.createElement('canvas');
  base.width = W * 2;
  base.height = H * 2;
  const ctx = base.getContext('2d');
  ctx.scale(2, 2);
  study.draw(ctx);
  return base;
}

export function paintStudy(canvas, base, study, gazes) {
  const ctx = canvas.getContext('2d');
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(base, 0, 0, W, H);
  study.eyes.forEach((eye, index) => {
    const gaze = gazes[index];
    if (study.pixel) {
      const dx = Math.round(gaze.x / 4) * 4;
      const dy = Math.round(gaze.y / 3) * 4;
      ctx.fillStyle = '#6e7950';
      ctx.fillRect(eye.x - 10, eye.y - 12, 20, 28);
      ctx.fillStyle = '#343d2f';
      ctx.fillRect(eye.x - 10, eye.y - 12, 20, 4);
      ctx.fillStyle = '#302f29';
      ctx.fillRect(eye.x - 6 + dx, eye.y - 4 + dy, 12, 16);
      ctx.fillStyle = '#ffefd0';
      ctx.fillRect(eye.x - 6 + dx, eye.y - 4 + dy, 4, 4);
      return;
    }
    oval(ctx, eye.x, eye.y, study.eyeWidth + 0.55, study.eyeHeight + 0.6, '#75674e');
    oval(ctx, eye.x, eye.y, study.eyeWidth, study.eyeHeight, '#8c9b72');
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(eye.x, eye.y, study.eyeWidth, study.eyeHeight, 0, 0, Math.PI * 2);
    ctx.clip();
    oval(ctx, eye.x + gaze.x, eye.y + gaze.y + 1, study.pupil, study.eyeHeight * 0.77, '#34372e');
    oval(ctx, eye.x + gaze.x - 1.8, eye.y + gaze.y - 3.5, 1.8, 2.2, '#fff5df');
    ctx.restore();
  });
}
