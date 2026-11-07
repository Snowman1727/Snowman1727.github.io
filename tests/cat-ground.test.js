import test from 'node:test';
import assert from 'node:assert/strict';
import * as ground from '../prototype/cat-ground.js';

test('ground projection places feet on an isometric plane, including depth', () => {
  assert.equal(typeof ground.projectGround, 'function');
  assert.deepEqual(ground.projectGround({ u: 0, v: 0 }), { x: 300, y: 146 });
  assert.deepEqual(ground.projectGround({ u: 1, v: 0 }), { x: 542, y: 238 });
  assert.deepEqual(ground.projectGround({ u: 0, v: 1 }), { x: 58, y: 238 });
  assert.deepEqual(ground.projectGround({ u: 1, v: 1 }), { x: 300, y: 330 });
  assert.deepEqual(ground.projectGround({ u: 0.5, v: 0.5 }), { x: 300, y: 238 });
});

test('pointer targets invert the plane projection and stay inside its inset edges', () => {
  assert.equal(typeof ground.groundTarget, 'function');
  assert.deepEqual(ground.groundTarget({ x: 300, y: 238 }), { u: 0.5, v: 0.5 });
  for (const [point, expected] of [
    [{ x: 300, y: -10000 }, { u: 0.2, v: 0.2 }],
    [{ x: 300, y: 10000 }, { u: 0.8, v: 0.8 }],
    [{ x: -10000, y: 238 }, { u: 0.2, v: 0.8 }],
    [{ x: 10000, y: 238 }, { u: 0.8, v: 0.2 }],
  ]) assert.deepEqual(ground.groundTarget(point), expected);
});

test('ground travel is gradual, stops near its target, and cannot overshoot', () => {
  assert.equal(typeof ground.advanceGround, 'function');
  const start = { u: 0.2, v: 0.2 };
  const target = { u: 0.8, v: 0.2 };
  const next = ground.advanceGround(start, target, 0.1);
  assert.ok(next.u > 0.2 && next.u < 0.8);
  assert.equal(next.v, 0.2);
  assert.equal(next.moving, true);
  const arrived = ground.advanceGround(start, target, 10);
  assert.ok(arrived.u >= 0.75 && arrived.u <= 0.8);
  assert.equal(arrived.v, 0.2);
  assert.equal(arrived.moving, false);
  assert.deepEqual(ground.advanceGround(arrived, target, 0.1), arrived);
  assert.deepEqual(ground.advanceGround(start, start, 0.1), { ...start, moving: false });
});

test('walking speed is frame independent and does not move without elapsed time', () => {
  assert.equal(typeof ground.advanceGround, 'function');
  const start = { u: 0.25, v: 0.25 };
  const target = { u: 0.75, v: 0.75 };
  assert.deepEqual(ground.advanceGround(start, target, 0), { ...start, moving: false });
  assert.deepEqual(ground.advanceGround(start, target, -1), { ...start, moving: false });
  const single = ground.advanceGround(start, target, 1 / 30);
  const half = ground.advanceGround(start, target, 1 / 60);
  const double = ground.advanceGround(half, target, 1 / 60);
  assert.ok(Math.abs(single.u - double.u) < 1e-12);
  assert.ok(Math.abs(single.v - double.v) < 1e-12);
});
