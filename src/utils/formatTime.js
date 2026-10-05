export function formatTime(value) {
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;
  const hour = Number(match[1]) % 24;
  const suffix = hour >= 12 ? 'p. m.' : 'a. m.';
  const normalized = hour % 12 || 12;
  return `${normalized}:${match[2]} ${suffix}`;
}

export function formatTimeRange(value) {
  return String(value).split('–').map(item => formatTime(item.trim())).join(' – ');
}
