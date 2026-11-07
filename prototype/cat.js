import { getCatAge, getGazeTarget, advanceGaze } from './pet-utils.js';
import { projectGround, groundTarget, advanceGround } from './cat-ground.js';
import { createCatScene, sceneSize } from './cat-scene.js';

export function createCat() {
  const age = document.querySelector('#cat-age');
  const canvas = document.querySelector('#cat-canvas');
  const section = document.querySelector('#yuanyuan');
  const paint = createCatScene(canvas);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const { signal } = controller;
  let position = { u: 0.5, v: 0.5 };
  let target = { ...position };
  let gaze = { x: 0, y: 0 };
  let facing = -1;
  let walkTime = 0;
  let walkAt = 0;
  let frame = 0;
  let previousTime = 0;
  let visible = false;
  let focused = true;
  let pointer = null;
  let touchStart = null;
  let bounds = canvas.getBoundingClientRect();
  let sectionBounds = section.getBoundingClientRect();

  const updateAge = () => {
    const { years, months } = getCatAge();
    age.replaceChildren(document.createTextNode(`${years} 岁 ${months} 个月`));
    const suffix = document.createElement('span');
    suffix.className = 'age-suffix';
    suffix.textContent = '啦';
    age.append(suffix);
  };
  updateAge();
  const ageInterval = setInterval(updateAge, 60_000);
  const enabled = () => visible && focused && !motion.matches && !document.hidden;
  const distance = () => Math.hypot(target.u - position.u, target.v - position.v);
  const draw = (phase = -1) => paint(position, gaze, facing, phase);
  const measure = () => {
    bounds = canvas.getBoundingClientRect();
    sectionBounds = section.getBoundingClientRect();
  };
  const local = point => ({
    x: (point.x - bounds.left) / bounds.width * sceneSize.width,
    y: (point.y - bounds.top) / bounds.height * sceneSize.height,
  });
  const lookTarget = () => {
    const feet = projectGround(position);
    return pointer ? getGazeTarget(pointer, {
      x: bounds.left + feet.x / sceneSize.width * bounds.width,
      y: bounds.top + (feet.y - 73) / sceneSize.height * bounds.height,
    }) : { x: 0, y: 0 };
  };
  const suspend = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    pointer = null;
    target = { ...position };
    gaze = { x: 0, y: 0 };
    draw();
  };
  const animate = time => {
    const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 1 / 60;
    previousTime = time;
    let moving = false;
    if (time >= walkAt) {
      const next = advanceGround(position, target, dt);
      moving = next.moving;
      position = { u: next.u, v: next.v };
      if (moving) walkTime += dt;
    }
    const desired = lookTarget();
    gaze = advanceGaze(gaze, desired, dt);
    const looking = Math.hypot(gaze.x - desired.x, gaze.y - desired.y) > 0.01;
    if (!looking) gaze = desired;
    draw(moving ? Math.floor(walkTime * 10) % 4 : -1);
    frame = distance() > 0.035001 || looking ? requestAnimationFrame(animate) : 0;
    if (!frame) previousTime = 0;
  };
  const wake = () => {
    if (!enabled()) return;
    if (!frame) frame = requestAnimationFrame(animate);
  };
  const destination = (next, delay = 160) => {
    if (distance() <= 0.035001) walkAt = performance.now() + delay;
    target = next;
    const dx = projectGround(target).x - projectGround(position).x;
    if (Math.abs(dx) > 3) facing = Math.sign(dx);
    wake();
  };
  const move = event => {
    if (event.pointerType !== 'mouse' || !enabled()) return;
    pointer = { x: event.clientX, y: event.clientY };
    if (pointer.y >= sectionBounds.top && pointer.y <= sectionBounds.bottom) {
      destination(groundTarget(local(pointer)));
    } else {
      target = { ...position };
      wake();
    }
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    measure();
    if (!enabled()) suspend();
  });
  observer.observe(canvas);
  draw();
  canvas.dataset.ready = 'true';

  document.addEventListener('pointermove', move, { signal, passive: true });
  document.documentElement.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') suspend();
  }, { signal });
  canvas.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse') touchStart = { x: event.clientX, y: event.clientY };
  }, { signal, passive: true });
  canvas.addEventListener('pointercancel', () => { touchStart = null; }, { signal });
  canvas.addEventListener('pointerup', event => {
    if (!touchStart || !enabled()) return;
    const end = { x: event.clientX, y: event.clientY };
    const isTap = Math.hypot(end.x - touchStart.x, end.y - touchStart.y) < 10;
    touchStart = null;
    if (!isTap) return;
    measure();
    pointer = end;
    destination(groundTarget(local(pointer)));
  }, { signal, passive: true });
  canvas.addEventListener('keydown', event => {
    const offsets = { ArrowLeft: [-70,0], ArrowRight: [70,0], ArrowUp: [0,-40], ArrowDown: [0,40], Home: [0,0] };
    const offset = offsets[event.key];
    if (!offset || !enabled()) return;
    event.preventDefault();
    const feet = event.key === 'Home' ? { x: 300, y: 238 } : projectGround(target);
    const next = { x: feet.x + offset[0], y: feet.y + offset[1] };
    pointer = { x: bounds.left + next.x / sceneSize.width * bounds.width, y: bounds.top + next.y / sceneSize.height * bounds.height };
    destination(groundTarget(next), 0);
  }, { signal });
  window.addEventListener('blur', () => { focused = false; suspend(); }, { signal });
  window.addEventListener('focus', () => { focused = true; measure(); }, { signal });
  const remeasure = () => { measure(); wake(); };
  window.addEventListener('resize', remeasure, { signal, passive: true });
  window.addEventListener('scroll', remeasure, { signal, passive: true });
  document.addEventListener('visibilitychange', () => { updateAge(); if (!enabled()) suspend(); }, { signal });
  motion.addEventListener('change', suspend, { signal });

  return () => {
    cancelAnimationFrame(frame);
    clearInterval(ageInterval);
    observer.disconnect();
    controller.abort();
    delete canvas.dataset.ready;
  };
}
