import { createIcons, ArrowLeft, ArrowUpRight, PawPrint } from 'lucide';
import { getCatAge, getGazeTarget, advanceGaze } from './pet-utils.js';
import { studies, prepareStudy, paintStudy } from './cat-study-art.js';
import './styles.css';
import './cat-studies.css';

createIcons({ icons: { ArrowLeft, ArrowUpRight, PawPrint } });
const { years, months } = getCatAge();
document.querySelector('#study-age').textContent = `${years} 岁 ${months} 个月`;

const controller = new AbortController();
const { signal } = controller;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const pointer = matchMedia('(hover: hover) and (pointer: fine)');
let cursor = null;
let frame = 0;
let previous = 0;
const models = studies.map(study => {
  const canvas = document.querySelector(`[data-variant="${study.id}"] canvas`);
  const base = prepareStudy(study);
  const current = study.eyes.map(() => ({ x: 0, y: 0 }));
  paintStudy(canvas, base, study, current);
  canvas.dataset.ready = 'true';
  return { study, canvas, base, current, target: study.eyes.map(() => ({ x: 0, y: 0 })) };
});

function animate(time) {
  const dt = previous ? Math.min((time - previous) / 1000, 0.05) : 1 / 60;
  previous = time;
  let moving = false;
  for (const model of models) {
    model.current = model.current.map((gaze, index) => advanceGaze(gaze, model.target[index], dt));
    paintStudy(model.canvas, model.base, model.study, model.current);
    moving ||= model.current.some((gaze, index) => Math.hypot(gaze.x - model.target[index].x, gaze.y - model.target[index].y) > 0.015);
  }
  frame = moving ? requestAnimationFrame(animate) : 0;
  if (!moving) previous = 0;
}

function stop() {
  cancelAnimationFrame(frame);
  frame = 0;
  previous = 0;
  for (const model of models) {
    model.current = model.study.eyes.map(() => ({ x: 0, y: 0 }));
    model.target = model.study.eyes.map(() => ({ x: 0, y: 0 }));
    paintStudy(model.canvas, model.base, model.study, model.current);
  }
}

function look() {
  if (motion.matches || !pointer.matches || document.hidden) { stop(); return; }
  for (const model of models) {
    const rect = model.canvas.getBoundingClientRect();
    // CSS object-fit may letterbox the fixed 10:7 drawing on wide cards.
    const scale = Math.min(rect.width / 400, rect.height / 280);
    const left = rect.left + (rect.width - 400 * scale) / 2;
    const top = rect.top + (rect.height - 280 * scale) / 2;
    const visible = rect.bottom > 0 && rect.top < innerHeight;
    model.target = model.study.eyes.map(eye => visible && cursor ? getGazeTarget(cursor, {
      x: left + eye.x * scale, y: top + eye.y * scale,
    }) : { x: 0, y: 0 });
  }
  if (!frame) frame = requestAnimationFrame(animate);
}

document.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse') return;
  cursor = { x: event.clientX, y: event.clientY };
  look();
}, { signal, passive: true });
document.documentElement.addEventListener('pointerleave', () => { cursor = null; look(); }, { signal });
window.addEventListener('scroll', look, { signal, passive: true });
window.addEventListener('resize', look, { signal, passive: true });
window.addEventListener('blur', stop, { signal });
document.addEventListener('visibilitychange', look, { signal });
motion.addEventListener('change', look, { signal });
pointer.addEventListener('change', look, { signal });

const selection = document.querySelector('#study-selection');
function select(id) {
  const study = studies.find(item => item.id === id);
  if (!study) return;
  document.querySelector(`input[value="${id}"]`).checked = true;
  selection.textContent = `已选 ${id.toUpperCase()} · ${study.name}`;
  selection.dataset.selected = id;
}
select(location.hash.slice(1));
document.querySelector('.study-grid').addEventListener('change', event => {
  if (!event.target.matches('input[type="radio"]')) return;
  select(event.target.value);
  history.replaceState(null, '', `#${event.target.value}`);
}, { signal });

if (import.meta.hot) {
  import.meta.hot.dispose(() => { stop(); controller.abort(); });
}
