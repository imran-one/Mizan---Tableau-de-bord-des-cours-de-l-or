export function computeChange(points) {
  const last = points.at(-1).c;
  const previous = points.at(-2).c;
  const delta = last - previous;
  const percent = (delta / previous) * 100;
  return { delta, percent };
}
