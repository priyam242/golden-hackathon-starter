/**
 * Generates monochrome canvas hatching patterns for Chart.js or canvas renderers.
 * Complies with the Strict Monochrome Design Lock (Zero colored hues).
 */

export function createHatchPattern(type = 'diagonal', isDark = false) {
  if (typeof document === 'undefined') return '#888888';
  const canvas = document.createElement('canvas');
  canvas.width = 12;
  canvas.height = 12;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '#888888';

  const strokeColor = isDark ? '#ffffff' : '#000000';
  const bgColor = isDark ? '#1a1a1a' : '#f0f0f0';

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 12, 12);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.5;

  if (type === 'diagonal') {
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(12, 0);
    ctx.stroke();
  } else if (type === 'cross') {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(12, 12);
    ctx.moveTo(12, 0);
    ctx.lineTo(0, 12);
    ctx.stroke();
  } else if (type === 'dots') {
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(6, 6, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  return ctx.createPattern(canvas, 'repeat');
}

