const calendar = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: 'numeric',
});

export function getCatAge(now = new Date()) {
  const parts = Object.fromEntries(calendar.formatToParts(now).map(({ type, value }) => [type, value]));
  const totalMonths = Math.max(0, (Number(parts.year) - 2025) * 12 + Number(parts.month) - 2);
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12 };
}

export function getGazeTarget(pointer, center) {
  const dx = pointer.x - center.x;
  const dy = pointer.y - center.y;
  const distance = Math.hypot(dx, dy);
  const divisor = Math.max(180, distance);
  return { x: dx / divisor * 4, y: dy / divisor * 3 };
}

export function advanceGaze(current, target, dt) {
  const alpha = 1 - Math.exp(-8 * Math.max(0, dt));
  return {
    x: current.x + (target.x - current.x) * alpha,
    y: current.y + (target.y - current.y) * alpha,
  };
}
