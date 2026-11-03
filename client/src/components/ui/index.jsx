import React from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Avatar, LinearProgress,
  IconButton, Tooltip, Stack, Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InboxIcon from '@mui/icons-material/InboxOutlined';
import { getInitials, getAvatarColor, formatPercent } from '../../utils/format';
import { ROLE_LABELS } from '../../utils/rbac';

/* ---------- Page header with breadcrumb + actions ---------- */
export const PageHeader = ({ title, subtitle, actions, breadcrumb = null }) => (
  <Box sx={{ mb: 3 }}>
    {breadcrumb}
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
      <Box>
        <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: '1.55rem', md: '1.9rem' } }}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
      </Box>
      {actions && <Stack direction="row" spacing={1} flexWrap="wrap">{actions}</Stack>}
    </Stack>
  </Box>
);

/* ---------- Card with optional title bar ---------- */
export const SectionCard = ({ title, subtitle, action, children, sx, contentSx, dense }) => (
  <Card sx={{ height: '100%', ...sx }}>
    {(title || action) && (
      <Box sx={{ px: 3, pt: 2.5, pb: dense ? 1 : 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          {title && <Typography variant="h6" fontWeight={700}>{title}</Typography>}
          {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Box>
        {action}
      </Box>
    )}
    <CardContent sx={{ pt: title ? 1.5 : 2.5, '&:last-child': { pb: 2.5 }, ...contentSx }}>{children}</CardContent>
  </Card>
);

/* ---------- Metric delta pill ---------- */
export const MetricDelta = ({ value, suffix = '%' }) => {
  const up = value >= 0;
  return (
    <Stack direction="row" alignItems="center" spacing={0.4} sx={{ color: up ? 'success.main' : 'error.main' }}>
      {up ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
      <Typography variant="caption" fontWeight={700}>
        {formatPercent(value)}{suffix !== '%' ? suffix : ''} vs last period
      </Typography>
    </Stack>
  );
};

/* ---------- KPI stat card ---------- */
export const KpiCard = ({ label, value, delta, icon, color = 'primary.main', hint }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, letterSpacing: '-0.02em' }}>{value}</Typography>
          {typeof delta === 'number' && <Box sx={{ mt: 0.5 }}><MetricDelta value={delta} /></Box>}
          {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
        </Box>
        {icon && (
          <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: `${color}1A`, color, display: 'flex' }}>{icon}</Box>
        )}
      </Stack>
    </CardContent>
  </Card>
);

/* ---------- Status chips ---------- */
const STATUS_STYLES = {
  active: { label: 'Active', color: 'success' },
  paid: { label: 'Paid', color: 'success' },
  ready: { label: 'Ready', color: 'success' },
  online: { label: 'Online', color: 'success' },
  lead: { label: 'Lead', color: 'info' },
  generating: { label: 'Generating', color: 'info' },
  away: { label: 'Away', color: 'warning' },
  pending: { label: 'Pending', color: 'warning' },
  paused: { label: 'Paused', color: 'warning' },
  inactive: { label: 'Inactive', color: 'default' },
  offline: { label: 'Offline', color: 'default' },
  churned: { label: 'Churned', color: 'error' },
  failed: { label: 'Failed', color: 'error' },
};

export const StatusChip = ({ status }) => {
  const s = STATUS_STYLES[status] || { label: status, color: 'default' };
  return <Chip size="small" label={s.label} color={s.color} variant={s.color === 'default' ? 'outlined' : 'filled'} />;
};

const ROLE_COLORS = { admin: 'secondary', manager: 'primary', viewer: 'default' };
export const RoleChip = ({ role }) => (
  <Chip size="small" label={ROLE_LABELS[role] || role} color={ROLE_COLORS[role] || 'default'} variant={role === 'viewer' ? 'outlined' : 'filled'} />
);

/* ---------- Avatar with deterministic color ---------- */
export const AppAvatar = ({ name, size = 36, src, children }) => (
  <Avatar src={src} sx={{ width: size, height: size, bgcolor: getAvatarColor(name), fontWeight: 700, fontSize: size * 0.36 }}>
    {children || getInitials(name)}
  </Avatar>
);

/* ---------- Progress bar with label ---------- */
export const ProgressBar = ({ label, current, target, unit = '', color = 'primary' }) => {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
        <Typography variant="body2" color="text.secondary">
          {unit}{current.toLocaleString()} / {unit}{target.toLocaleString?.() ?? target}
        </Typography>
      </Stack>
      <LinearProgress variant="determinate" value={pct} color={color} sx={{ height: 8, borderRadius: 4 }} />
    </Box>
  );
};

/* ---------- Empty state ---------- */
export const EmptyState = ({ icon, title = 'Nothing here yet', message, action }) => (
  <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
    <Box sx={{ mx: 'auto', mb: 1.5, width: 64, height: 64, borderRadius: 3, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
      {icon || <InboxIcon fontSize="large" />}
    </Box>
    <Typography variant="h6" fontWeight={700}>{title}</Typography>
    {message && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 360, mx: 'auto' }}>{message}</Typography>}
    {action && <Box sx={{ mt: 2 }}>{action}</Box>}
  </Box>
);

/* ---------- Small labelled list row ---------- */
export const InfoRow = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between" sx={{ py: 0.9, borderBottom: '1px solid', borderColor: 'divider' }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight={600}>{value}</Typography>
  </Stack>
);

/* ---------- Icon action wrapper ---------- */
export const IconAction = ({ title, onClick, children, color = 'default' }) => (
  <Tooltip title={title}>
    <IconButton size="small" onClick={onClick} color={color}>{children}</IconButton>
  </Tooltip>
);

/* ---------- Overflow menu button ---------- */
export const MoreButton = (props) => (
  <IconButton size="small" {...props}><MoreVertIcon fontSize="small" /></IconButton>
);

/* ---------- Gradient hero box (public pages) ---------- */
export const GradientText = ({ children, sx }) => (
  <Typography
    component="span"
    sx={{
      background: 'linear-gradient(120deg, #818CF8 0%, #6366F1 40%, #A78BFA 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 800,
      ...sx,
    }}
  >
    {children}
  </Typography>
);

export const AppButton = Button;
