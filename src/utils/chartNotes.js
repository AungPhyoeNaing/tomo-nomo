const fields = { sun: 'western', moon: 'moonSign', venus: 'venusSign', mars: 'marsSign' };

export function chartPlacementLabel(metrics, body) {
  if (metrics.chartInfo?.source === 'calendar-fallback') {
    return body === 'sun' ? `${metrics.western} (calendar estimate)` : 'Unavailable';
  }
  const options = metrics.chartInfo?.possibleSigns?.[body];
  if (options?.length > 1) return `${options.join(' / ')} (birth time or time zone may change the sign)`;
  const sign = metrics[fields[body]];
  return sign ? `${sign} (estimate)` : 'Unavailable';
}
