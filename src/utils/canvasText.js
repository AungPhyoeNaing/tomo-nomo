function graphemes(text) {
  const segments = typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter('my', { granularity: 'grapheme' }).segment(String(text)), item => item.segment)
    : Array.from(String(text));
  // ICU versions differ on Myanmar marks/conjuncts; never start a new line with a detached mark.
  return segments.reduce((combined, segment) => {
    if (combined.length && (/^\p{Mark}/u.test(segment) || /[\u1039\u200d]$/u.test(combined.at(-1)))) combined[combined.length - 1] += segment;
    else combined.push(segment);
    return combined;
  }, []);
}

// Measure rendered graphemes, not spaces/character counts: Burmese often has no word spaces.
export function wrapCanvasText(context, text, maxWidth, maxLines) {
  const segments = graphemes(text);
  const lines = [];
  let line = '';
  for (const segment of segments) {
    if (segment === '\n' || (line && context.measureText(line + segment).width > maxWidth)) {
      lines.push(line.trimEnd());
      line = '';
      if (lines.length === maxLines) break;
    }
    if (segment !== '\n' && (line || segment.trim())) line += segment;
  }
  if (line && lines.length < maxLines) lines.push(line.trimEnd());
  const consumed = lines.join('').replace(/\s/gu, '').length;
  const truncated = consumed < String(text).replace(/\s/gu, '').length;
  if (truncated && lines.length) {
    const last = graphemes(lines.at(-1));
    while (last.length && context.measureText(last.join('') + '…').width > maxWidth) last.pop();
    lines[lines.length - 1] = last.join('') + '…';
  }
  return { lines, truncated };
}
