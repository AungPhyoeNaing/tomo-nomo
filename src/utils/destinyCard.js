import { wrapCanvasText } from './canvasText.js';

const WIDTH = 1080;
const CONTENT = 904;
const COLORS = { background: '#110f15', paper: '#211e28', edge: '#ac4215', ember: '#f07841', peach: '#edb394', ink: '#f1edeb', muted: '#bdb0bb' };
const font = (size, weight = 400) => `${weight} ${size}px "Padauk", "Fredoka", "Myanmar Text", sans-serif`;

export function layoutTomoCard(context, { result, p1Name, p2Name, breakdown = [] }) {
  context.font = font(56, 700);
  const first = wrapCanvasText(context, p1Name, CONTENT - 40, 3);
  const second = wrapCanvasText(context, p2Name, CONTENT - 40, 3);
  context.font = font(44, 700);
  const title = wrapCanvasText(context, result.relationship_title || 'Your duo story', CONTENT, 5);
  context.font = font(36);
  const advice = wrapCanvasText(context, result.tomo_secret_advice || '', CONTENT - 64, 38);
  const namesY = 190;
  const scoreY = namesY + (first.lines.length + second.lines.length) * 72 + 196;
  const titleY = scoreY + 180;
  const metricsY = titleY + title.lines.length * 62 + 38;
  const metricsHeight = breakdown.length ? 92 + breakdown.length * 56 : 0;
  const noteY = metricsY + metricsHeight + 36;
  const noteHeight = 142 + advice.lines.length * 56;
  return { width: WIDTH, height: noteY + noteHeight + 180, first, second, title, advice, namesY, scoreY, titleY, metricsY, metricsHeight, noteY, noteHeight };
}

export async function createTomoCard({ result, p1Name, p2Name, relType, mood, breakdown = [] }) {
  // Bound font loading so an offline font request cannot strand the save button.
  let fontTimer;
  if (document.fonts) {
    try {
      await Promise.race([
        Promise.all([document.fonts.load('700 56px "Padauk"'), document.fonts.load('500 44px "Fredoka"')]).catch(() => []),
        new Promise(resolve => { fontTimer = setTimeout(resolve, 2500); })
      ]);
    } finally { clearTimeout(fontTimer); }
  }
  const canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  if (!context) throw new Error('Image export is unavailable in this browser.');
  const layout = layoutTomoCard(context, { result, p1Name, p2Name, breakdown });
  canvas.width = layout.width;
  canvas.height = layout.height;
  context = canvas.getContext('2d');
  const c = COLORS;
  const panel = (x, y, width, height, radius = 24) => {
    context.beginPath();
    if (context.roundRect) context.roundRect(x, y, width, height, radius);
    else context.rect(x, y, width, height);
    context.fill();
    context.stroke();
  };
  const text = (value, x, y, size, color = c.ink, weight = 400, align = 'left') => {
    context.font = font(size, weight); context.fillStyle = color; context.textAlign = align;
    context.fillText(value, x, y);
  };
  const lines = (items, y, size, lineHeight, color = c.ink, x = 540, align = 'center', weight = 400) => items.forEach((line, index) => text(line, x, y + index * lineHeight, size, color, weight, align));

  context.fillStyle = c.background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  // The same ember ticket frame and small constellation details as the site.
  context.strokeStyle = c.edge; context.lineWidth = 3; context.fillStyle = c.paper;
  panel(28, 28, WIDTH - 56, canvas.height - 56, 42);
  context.fillStyle = '#f0784122';
  for (let x = 64; x < WIDTH; x += 68) for (let y = 64; y < canvas.height - 40; y += 68) context.fillRect(x, y, 2, 2);
  text('tomo + nomo', 88, 104, 44, c.ink, 700);
  text('Your connection arcade', 992, 102, 25, c.peach, 400, 'right');
  text(`${relType === 'Couple' ? 'Couple' : 'Friends'}  /  ${mood} voice`, 540, 154, 28, c.peach, 700, 'center');
  lines(layout.first.lines, layout.namesY + 52, 56, 72, c.ink, 540, 'center', 700);
  const ampY = layout.namesY + layout.first.lines.length * 72 + 28;
  text('&', 540, ampY, 38, c.ember, 700, 'center');
  lines(layout.second.lines, ampY + 68, 56, 72, c.ink, 540, 'center', 700);
  const score = Math.max(0, Math.min(100, Number(result.chemistry_score) || 0));
  context.lineWidth = 12; context.lineCap = 'round';
  context.beginPath(); context.arc(540, layout.scoreY, 100, 0, Math.PI * 2); context.strokeStyle = '#4c3030'; context.stroke();
  if (score > 0) { context.beginPath(); context.arc(540, layout.scoreY, 100, -Math.PI / 2, -Math.PI / 2 + score / 100 * Math.PI * 2); context.strokeStyle = c.ember; context.stroke(); }
  text(`${score}%`, 540, layout.scoreY + 20, 76, c.ink, 700, 'center');
  text('Symbolic game score', 540, layout.scoreY + 143, 26, c.peach, 400, 'center');
  lines(layout.title.lines, layout.titleY + 38, 44, 62, c.peach, 540, 'center', 700);

  if (breakdown.length) {
    context.fillStyle = '#2c2330'; context.strokeStyle = '#7e452f'; context.lineWidth = 2;
    panel(88, layout.metricsY, CONTENT, layout.metricsHeight);
    text('The five story influences', 120, layout.metricsY + 49, 30, c.peach, 700);
    const labels = ['Western astrology', 'Myanmar Mahabote', 'Chinese zodiac', 'Five elements', 'Numerology'];
    breakdown.forEach((metric, index) => {
      const y = layout.metricsY + 101 + index * 56;
      text(labels[index] || 'Story influence', 120, y, 28);
      text(`${Math.round(metric.score)}%`, 956, y, 28, c.peach, 700, 'right');
      context.fillStyle = '#4c3030'; context.fillRect(480, y - 16, 360, 8);
      context.fillStyle = c.ember; context.fillRect(480, y - 16, Math.max(0, Math.min(100, metric.score)) / 100 * 360, 8);
    });
  }
  context.fillStyle = '#30252e'; context.strokeStyle = '#a95b3d'; context.lineWidth = 2;
  panel(88, layout.noteY, CONTENT, layout.noteHeight);
  text(layout.advice.truncated ? 'A note from Tomo · excerpt' : 'A note from Tomo', 120, layout.noteY + 60, 34, c.peach, 700);
  lines(layout.advice.lines, layout.noteY + 122, 36, 56, c.ink, 120, 'left');
  text(result.readingInfo?.source === 'gemini' ? 'Gemini AI reading' : result.readingInfo?.fallback ? 'Built-in story · AI fallback' : 'Built-in story', 540, canvas.height - 105, 25, c.peach, 400, 'center');
  text('Astrology-inspired entertainment · tomo-nomo.vercel.app', 540, canvas.height - 62, 23, c.muted, 400, 'center');
  const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not create your card.')), 'image/png'));
  const safe = value => Array.from(String(value).replace(/[<>:"/\\|?*\p{Cc}]/gu, '').trim()).slice(0, 28).join('') || 'player';
  return { blob, filename: `Tomo_${safe(p1Name)}_${safe(p2Name)}_${relType}_${mood}.png`, width: canvas.width, height: canvas.height };
}
