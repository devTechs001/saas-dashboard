// Shared formatting helpers.

export const formatCurrency = (value, currency = 'USD', digits = 0) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value ?? 0);

export const formatNumber = (value, digits = 0) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value ?? 0);

export const formatCompact = (value) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value ?? 0);

export const formatPercent = (value, digits = 1) =>
  `${value >= 0 ? '+' : ''}${(value ?? 0).toFixed(digits)}%`;

export const formatDate = (value, opts = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  new Intl.DateTimeFormat('en-US', opts).format(new Date(value));

export const formatRelative = (value) => {
  const diffMs = Date.now() - new Date(value).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
};

export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?';

// Deterministic pleasant avatar background from a name.
const AVATAR_COLORS = ['#4F46E5', '#0EA5E9', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777', '#0891B2'];
export const getAvatarColor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
