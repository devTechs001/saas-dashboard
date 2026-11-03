// Shared formatting helpers. All functions are defensive: hostile or
// malformed input (null, NaN, Infinity, invalid dates) must never throw.

const toFinite = (value) => (Number.isFinite(value) ? value : 0);

export const formatCurrency = (value, currency = 'USD', digits = 0) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(toFinite(value));
  } catch {
    return '—';
  }
};

export const formatNumber = (value, digits = 0) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(toFinite(value));

export const formatCompact = (value) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(toFinite(value));

export const formatPercent = (value, digits = 1) => {
  if (!Number.isFinite(value)) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}%`;
};

export const formatDate = (value, opts = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (value == null || value === '') return '—'; // missing date ≠ epoch
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', opts).format(date);
  } catch {
    return '—';
  }
};

export const formatRelative = (value) => {
  if (value == null || value === '') return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
};

export const getInitials = (name = '') => {
  if (typeof name !== 'string') return '?';
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => Array.from(p)[0].toUpperCase()) // code-point safe (emoji-surrogate proof)
      .join('') || '?'
  );
};

// Deterministic pleasant avatar background from a name.
const AVATAR_COLORS = ['#4F46E5', '#0EA5E9', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777', '#0891B2'];
export const getAvatarColor = (name = '') => {
  const key = typeof name === 'string' ? name : String(name ?? '');
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
