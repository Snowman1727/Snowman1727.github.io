// Throwaway: one approved homepage composition, pending visual feedback.
import { createIcons, ArrowDown, ArrowDownRight, ArrowUp, ArrowUpRight, Github, Moon, Pause, PawPrint, Play, RotateCcw, Snowflake, Sun } from 'lucide';
import { createPlanet } from './planet.js';
import { createCat } from './cat.js';
import './styles.css';

const icons = { ArrowDown, ArrowDownRight, ArrowUp, ArrowUpRight, Github, Moon, Pause, PawPrint, Play, RotateCcw, Snowflake, Sun };
const refreshIcons = () => createIcons({ icons });
refreshIcons();
document.querySelector('#year').textContent = new Date().getFullYear();
const disposeCat = createCat();

const canvas = document.querySelector('#planet-canvas');
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('#motion-toggle');
const timeButton = document.querySelector('#time-toggle');
const announcement = document.querySelector('#scene-announcement');
const announce = (message) => { announcement.textContent = message; };

function setButton(button, label, icon, pressed) {
  button.setAttribute('aria-label', label);
  button.title = label;
  button.setAttribute('aria-pressed', String(pressed));
  button.innerHTML = `<i data-lucide="${icon}" aria-hidden="true"></i>`;
  refreshIcons();
}

let planet;
function showFallback() {
  canvas.hidden = true;
  delete canvas.dataset.ready;
  document.querySelector('.scene-fallback').hidden = false;
  document.querySelectorAll('.scene-controls button').forEach((button) => { button.disabled = true; });
  document.querySelector('#world-label').textContent = '静景';
}

try {
  planet = createPlanet(canvas, { reducedMotion: motionQuery.matches });
  canvas.dataset.ready = 'true';
} catch (error) {
  console.error('Planet renderer could not start:', error);
  showFallback();
}

canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  planet?.dispose();
  showFallback();
}, { once: true });

document.querySelector('.scene-fallback img').addEventListener('error', () => {
  if (canvas.hidden) document.querySelector('.scene-error').hidden = false;
});

if (planet) {
  const syncMotion = () => {
    setButton(motionButton, planet.paused ? '继续旋转' : '暂停旋转', planet.paused ? 'play' : 'pause', planet.paused);
  };
  syncMotion();
  motionButton.addEventListener('click', () => {
    planet.setPaused(!planet.paused);
    syncMotion();
    announce(planet.paused ? '星球已暂停' : '星球继续旋转');
  });
  timeButton.addEventListener('click', () => {
    planet.setDay(!planet.day);
    setButton(timeButton, planet.day ? '切换到雪夜' : '切换到白昼', planet.day ? 'moon' : 'sun', planet.day);
    document.querySelector('#world-label').textContent = planet.day ? '白昼' : '雪夜';
    announce(planet.day ? '星球已切换到白昼' : '星球已切换到雪夜');
  });
  document.querySelector('#reset-planet').addEventListener('click', () => {
    planet.reset();
    announce('星球视角已重置');
  });
  motionQuery.addEventListener('change', (event) => {
    planet.setReducedMotion(event.matches);
    syncMotion();
  });
  canvas.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', ' '].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') planet.reset();
    else if (event.key === ' ') { planet.setPaused(!planet.paused); syncMotion(); }
    else planet.nudge(event.key);
  });
}

const navLinks = [...document.querySelectorAll('.navigation a')];
const sections = [...document.querySelectorAll('main > section')];
const navigationObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    navLinks.forEach((link) => {
      const active = link.hash === `#${entry.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }
}, { rootMargin: '-15% 0px -35% 0px' });
sections.forEach((section) => navigationObserver.observe(section));

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    navigationObserver.disconnect();
    disposeCat();
    planet?.dispose();
  });
}
