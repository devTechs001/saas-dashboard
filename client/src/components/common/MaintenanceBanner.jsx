import React from 'react';
import { Alert, AlertTitle, Chip, Stack, Collapse } from '@mui/material';
import BuildIcon from '@mui/icons-material/BuildOutlined';
import { useSelector } from 'react-redux';

const LEVEL_LABELS = {
  none: 'Maintenance off',
  partial: 'Partial maintenance',
  full: 'Full maintenance',
};

/**
 * App-wide maintenance notice. Rendered in MainLayout — reads the mirrored
 * maintenance state (initial fetch + `maintenance:update` realtime events).
 */
const MaintenanceBanner = () => {
  const m = useSelector((state) => state.maintenance);
  const active = m.loaded && m.level !== 'none';
  const writesBlocked = active && m.effective?.writesBlocked;

  return (
    <Collapse in={active}>
      <Alert
        severity={m.level === 'full' ? 'error' : 'warning'}
        icon={<BuildIcon />}
        sx={{ mb: 2, borderRadius: 2.5 }}
      >
        <AlertTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          {LEVEL_LABELS[m.level] || 'Maintenance in progress'}
          <Chip size="small" label={m.level} color={m.level === 'full' ? 'error' : 'warning'} sx={{ height: 20, textTransform: 'capitalize' }} />
          {writesBlocked && <Chip size="small" label="Read-only" variant="outlined" sx={{ height: 20 }} />}
        </AlertTitle>
        {m.message || 'Our team is performing repairs. Some features may be unavailable.'}
        {m.until ? ` Expected back: ${new Date(m.until).toLocaleString()}.` : ''}
        {writesBlocked && ' Actions that change data are temporarily disabled.'}
      </Alert>
    </Collapse>
  );
};

export default MaintenanceBanner;
