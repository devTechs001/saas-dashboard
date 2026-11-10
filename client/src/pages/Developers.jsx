import React from 'react';
import {
  Box, Typography, Grid, Stack, Chip, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, TextField, InputAdornment,
  Tabs, Tab, List, ListItem, ListItemIcon, ListItemText, Tooltip, Switch, useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopyOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import WebhookIcon from '@mui/icons-material/WebhookOutlined';
import KeyIcon from '@mui/icons-material/KeyOutlined';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import BoltIcon from '@mui/icons-material/BoltOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { PageHeader, SectionCard, KpiCard, StatusChip, AppAvatar } from '../components/ui';
import { AreaTrendChart } from '../components/charts';
import { DEMO_AVAILABLE } from '../config/env';
// Sample dataset: dev builds only. Vite replaces DEMO_AVAILABLE with a
// literal, so the whole `mock*` import is tree-shaken out of production.
import { apiKeys as mockApiKeys, webhooks as mockWebhooks, trafficSeries as mockTrafficSeries } from '../data/sampleData';
const apiKeys = DEMO_AVAILABLE ? mockApiKeys : [];
const webhooks = DEMO_AVAILABLE ? mockWebhooks : [];
const trafficSeries = DEMO_AVAILABLE ? mockTrafficSeries : [];
import { formatRelative, formatCompact, formatDate } from '../utils/format';

const CODE_SNIPPET = `curl -X GET https://api.nexus.io/api/v1/customers \\
  -H "Authorization: Bearer sk_live_8f2a…c91d" \\
  -H "Content-Type: application/json"

# 200 OK
{
  "statusCode": 200,
  "message": "Success",
  "success": true,
  "data": {
    "customers": [ … ],
    "pagination": { "total": 128, "page": 1, "limit": 10, "pages": 13 }
  }
}`;

const EVENT_TYPES = [
  { name: 'invoice.paid', desc: 'Fired when an invoice is settled' },
  { name: 'invoice.payment_failed', desc: 'Fired after a failed payment attempt' },
  { name: 'user.created', desc: 'Fired when a member joins the workspace' },
  { name: 'report.generated', desc: 'Fired when a report artifact is ready' },
  { name: 'analytics.anomaly.detected', desc: 'Fired when the AI model flags an anomaly' },
];

const Developers = () => {
  const theme = useTheme();
  const [tab, setTab] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  const copySnippet = () => {
    navigator.clipboard?.writeText(CODE_SNIPPET).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Box>
      <PageHeader
        title="Developer Platform"
        subtitle="API keys, webhooks, and everything you need to build on Nexus."
        actions={[
          <Button key="docs" variant="outlined" startIcon={<DescriptionIcon />} sx={{ borderRadius: 2.5 }}>API docs</Button>,
          <Button key="key" variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2.5 }}>Create API key</Button>,
        ]}
      />

      {/* KPIs */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="API calls (30d)" value={formatCompact(1284000)} delta={14.2} hint="vs previous period" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Error rate" value="0.12%" delta={-0.4} hint="vs previous period" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="p95 latency" value="128 ms" delta={-6.8} hint="vs previous period" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Active webhooks" value="1" hint="1 paused" />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ mt: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="API keys" />
          <Tab label="Webhooks" />
          <Tab label="API usage" />
          <Tab label="Quickstart" />
        </Tabs>
      </Box>

      {/* ===== API keys ===== */}
      {tab === 0 && (
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <SectionCard
              title="API keys"
              subtitle="Keys inherit your role's permissions. Store them securely — full values are shown only once."
              contentSx={{ pt: 1 }}
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Key</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Scope</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Last used</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiKeys.map((k) => (
                      <TableRow key={k.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 32, height: 32, borderRadius: 1.75, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
                              <KeyIcon fontSize="small" color="primary" />
                            </Box>
                            <Typography variant="body2" fontWeight={700}>{k.name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12.5 }}>{k.prefix}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={k.scope} variant="outlined" color={k.scope === 'full' ? 'primary' : 'default'} />
                        </TableCell>
                        <TableCell>{formatDate(k.created)}</TableCell>
                        <TableCell>{formatRelative(k.lastUsed)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Copy key ID">
                            <IconButton size="small"><ContentCopyIcon fontSize="small" /></IconButton>
                          </Tooltip>
                          <Tooltip title="Reveal">
                            <IconButton size="small"><VisibilityIcon fontSize="small" /></IconButton>
                          </Tooltip>
                          <Tooltip title="Revoke">
                            <IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionCard>
          </Grid>
        </Grid>
      )}

      {/* ===== Webhooks ===== */}
      {tab === 1 && (
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12} lg={7}>
            <SectionCard
              title="Webhook endpoints"
              subtitle="We POST JSON events to your endpoints with an HMAC signature."
              contentSx={{ pt: 1 }}
            >
              <List disablePadding>
                {webhooks.map((w) => (
                  <ListItem key={w.id} disablePadding sx={{ py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <ListItemIcon sx={{ minWidth: 42 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
                        <WebhookIcon fontSize="small" color={w.status === 'active' ? 'success' : 'disabled'} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', fontSize: 12.5 }}>{w.url}</Typography>}
                      secondary={
                        <Stack direction="row" spacing={0.75} sx={{ mt: 0.5, flexWrap: 'wrap', useFlexGap: true }}>
                          {w.events.map((e) => <Chip key={e} size="small" label={e} variant="outlined" sx={{ height: 20, fontSize: 10.5 }} />)}
                          <Typography variant="caption" color="text.disabled">Last delivery {formatRelative(w.lastDelivery)}</Typography>
                        </Stack>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                    <Stack direction="row" spacing={1} alignItems="center">
                      <StatusChip status={w.status} />
                      <Switch size="small" checked={w.status === 'active'} />
                    </Stack>
                  </ListItem>
                ))}
              </List>
              <Button fullWidth variant="outlined" startIcon={<AddIcon />} sx={{ mt: 2, borderRadius: 2.5, borderStyle: 'dashed' }}>
                Add endpoint
              </Button>
            </SectionCard>
          </Grid>
          <Grid item xs={12} lg={5}>
            <SectionCard title="Event catalog" subtitle="Available webhook event types">
              <List disablePadding>
                {EVENT_TYPES.map((e) => (
                  <ListItem key={e.name} disablePadding sx={{ py: 0.9, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 32, mt: 0.4 }}><BoltIcon fontSize="small" color="warning" /></ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', fontSize: 12 }}>{e.name}</Typography>}
                      secondary={e.desc}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
        </Grid>
      )}

      {/* ===== API usage ===== */}
      {tab === 2 && (
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <SectionCard title="API traffic" subtitle="Requests per day, last 30 days">
              <AreaTrendChart
                data={trafficSeries.map((d) => ({ date: d.date, calls: d.pageViews * 8 }))}
                xKey="date"
                height={300}
                series={[{ key: 'calls', name: 'API calls', color: '#0EA5E9' }]}
                formatValue={(v) => formatCompact(v)}
              />
            </SectionCard>
          </Grid>
        </Grid>
      )}

      {/* ===== Quickstart ===== */}
      {tab === 3 && (
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12} lg={7}>
            <SectionCard
              title="Quickstart"
              subtitle="Your first API call in under a minute"
              action={
                <Button size="small" variant="outlined" startIcon={copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />} onClick={copySnippet} sx={{ borderRadius: 2 }}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              }
            >
              <Box sx={{
                p: 2.25, borderRadius: 2.5, overflowX: 'auto',
                bgcolor: theme.palette.mode === 'dark' ? '#0B1020' : '#0F172A',
                color: '#E2E8F0',
              }}>
                <Typography component="pre" sx={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12.5, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {CODE_SNIPPET}
                </Typography>
              </Box>
              <Stack spacing={1.25} sx={{ mt: 2.25 }}>
                {[
                  'All responses use the platform envelope — statusCode, message, data, success.',
                  'Authenticate with a Bearer token; rotate keys from the API keys tab.',
                  'Rate limits: 300 req/min per user, 1000 req/min per service token.',
                ].map((t) => (
                  <Stack key={t} direction="row" spacing={1} alignItems="center">
                    <CheckIcon fontSize="small" color="success" />
                    <Typography variant="body2" color="text.secondary">{t}</Typography>
                  </Stack>
                ))}
              </Stack>
            </SectionCard>
          </Grid>
          <Grid item xs={12} lg={5}>
            <SectionCard title="SDKs & libraries" subtitle="Official clients">
              <List disablePadding>
                {[
                  { name: 'JavaScript / TypeScript', tag: 'v2.4.1', color: '#F59E0B' },
                  { name: 'Python', tag: 'v2.4.1', color: '#2563EB' },
                  { name: 'Java', tag: 'v1.9.0', color: '#DC2626' },
                  { name: 'Rust', tag: 'v0.8.2', color: '#7C3AED' },
                  { name: 'Go', tag: 'v1.2.0', color: '#0EA5E9' },
                ].map((s) => (
                  <ListItem key={s.name} disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 38 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: 1.5, bgcolor: `${s.color}1A`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                        {s.name.charAt(0)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText primary={s.name} secondary={s.tag} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} secondaryTypographyProps={{ variant: 'caption' }} />
                    <Button size="small" variant="outlined" sx={{ borderRadius: 2 }}>Install</Button>
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Developers;
