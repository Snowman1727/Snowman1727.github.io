import test from 'node:test';
import assert from 'node:assert/strict';
import { getCatAge, getGazeTarget, advanceGaze } from '../prototype/pet-utils.js';

test('age advances by calendar month without inventing a birth day', () => {
  const cases = [
    ['2025-02-01T00:00:00+08:00', { years: 0, months: 0 }],
    ['2026-01-31T12:00:00+08:00', { years: 0, months: 11 }],
    ['2026-02-01T00:00:00+08:00', { years: 1, months: 0 }],
    ['2026-11-07T12:00:00+08:00', { years: 1, months: 9 }],
    ['2027-02-01T00:00:00+08:00', { years: 2, months: 0 }],
    ['2025-01-01T00:00:00+08:00', { years: 0, months: 0 }],
  ];
  for (const [date, expected] of cases) {
    assert.deepEqual(getCatAge(new Date(date)), expected, date);
  }
});

test('age uses the Shanghai month rather than the visitor time zone', () => {
  assert.deepEqual(getCatAge(new Date('2026-01-31T15:59:59Z')), { years: 0, months: 11 });
  assert.deepEqual(getCatAge(new Date('2026-01-31T16:00:00Z')), { years: 1, months: 0 });
});

test('eyes look toward the mouse without leaving the eye sockets', () => {
  const center = { x: 100, y: 100 };
  assert.deepEqual(getGazeTarget(center, center), { x: 0, y: 0 });
  assert.deepEqual(getGazeTarget({ x: 280, y: 100 }, center), { x: 4, y: 0 });
  assert.deepEqual(getGazeTarget({ x: -80, y: 100 }, center), { x: -4, y: 0 });
  assert.deepEqual(getGazeTarget({ x: 100, y: -80 }, center), { x: 0, y: -3 });
  assert.deepEqual(getGazeTarget({ x: 190, y: 100 }, center), { x: 2, y: 0 });
  for (const pointer of [{ x: 10000, y: -10000 }, { x: -99999, y: 99999 }]) {
    const gaze = getGazeTarget(pointer, center);
    assert.ok((gaze.x / 4) ** 2 + (gaze.y / 3) ** 2 <= 1.000001);
  }
});

test('gaze eases toward the target without overshooting', () => {
  const position = advanceGaze({ x: 0, y: 0 }, { x: 100, y: 200 }, 1 / 60);
  assert.ok(position.x > 0 && position.x < 100);
  assert.ok(position.y > 0 && position.y < 200);
  let current = { x: 0, y: 0 };
  for (let frame = 0; frame < 60; frame++) current = advanceGaze(current, { x: 100, y: 200 }, 1 / 60);
  assert.ok(Math.abs(current.x - 100) < 1);
  assert.ok(Math.abs(current.y - 200) < 1);
});

test('motion does not depend on frame rate and stays still at rest', () => {
  const start = { x: 20, y: 30 };
  const target = { x: 120, y: 230 };
  const single = advanceGaze(start, target, 1 / 30);
  const firstHalf = advanceGaze(start, target, 1 / 60);
  const twoHalves = advanceGaze(firstHalf, target, 1 / 60);
  assert.ok(Math.abs(single.x - twoHalves.x) < 1e-10);
  assert.ok(Math.abs(single.y - twoHalves.y) < 1e-10);
  assert.deepEqual(advanceGaze(start, target, 0), start);
  assert.deepEqual(advanceGaze(start, start, 1 / 60), start);
});
