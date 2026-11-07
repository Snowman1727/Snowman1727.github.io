export const groundInset = 0.2;
const clamp = value => Math.max(groundInset, Math.min(1 - groundInset, value));

export function projectGround({ u, v }) {
  return { x: 300 + (u - v) * 242, y: 146 + (u + v) * 92 };
}

export function groundTarget({ x, y }) {
  const across = (x - 300) / 242;
  const depth = (y - 146) / 92;
  return { u: clamp((depth + across) / 2), v: clamp((depth - across) / 2) };
}

export function advanceGround(position, target, dt) {
  const du = target.u - position.u;
  const dv = target.v - position.v;
  const distance = Math.hypot(du, dv);
  const remaining = Math.max(0, distance - 0.035);
  const step = Math.min(remaining, Math.max(0, dt) * 0.46);
  if (!step) return { u: position.u, v: position.v, moving: false };
  return {
    u: position.u + du / distance * step,
    v: position.v + dv / distance * step,
    moving: remaining - step > 1e-9,
  };
}
