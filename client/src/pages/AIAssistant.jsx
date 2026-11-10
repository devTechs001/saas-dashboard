import React from 'react';
import {
  Box, Typography, Grid, Stack, Card, CardContent, TextField, IconButton, Chip,
  Button, Divider, useTheme, Avatar, Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUpOutlined';
import WarningIcon from '@mui/icons-material/WarningAmberOutlined';
import InsightsIcon from '@mui/icons-material/InsightsOutlined';
import BoltIcon from '@mui/icons-material/BoltOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopyOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUpAltOutlined';
import { PageHeader, SectionCard, AppAvatar, MetricDelta } from '../components/ui';
import { DonutChart, Sparkline } from '../components/charts';
import { DEMO_AVAILABLE } from '../config/env';
// Sample dataset: dev builds only. Vite replaces DEMO_AVAILABLE with a
// literal, so the whole `mock*` import is tree-shaken out of production.
import { kpis as mockKpis, aiInsights as mockAiInsights, revenueSeries as mockRevenueSeries, revenueByPlan as mockRevenueByPlan } from '../data/sampleData';
const kpis = DEMO_AVAILABLE ? mockKpis : {};
const aiInsights = DEMO_AVAILABLE ? mockAiInsights : [];
const revenueSeries = DEMO_AVAILABLE ? mockRevenueSeries : [];
const revenueByPlan = DEMO_AVAILABLE ? mockRevenueByPlan : [];
import { formatCurrency } from '../utils/format';

const INSIGHT_ICONS = {
  opportunity: { icon: <TrendingUpIcon />, color: '#059669', label: 'Opportunity' },
  risk: { icon: <WarningIcon />, color: '#E11D48', label: 'Risk' },
  trend: { icon: <InsightsIcon />, color: '#2563EB', label: 'Forecast' },
  anomaly: { icon: <BoltIcon />, color: '#D97706', label: 'Anomaly' },
};

const SUGGESTIONS = [
  'What drove revenue growth last month?',
  'Which customers are at risk of churning?',
  'Forecast MRR for next quarter',
  'How is our signup conversion trending?',
];

const SAMPLE_REPLIES = [
  "Revenue grew 12.4% month-over-month, driven primarily by Enterprise upgrades (+$9.2k) and 63 new Business subscriptions. Churn stayed flat at 1.9%, so net new MRR was $8.4k.",
  "Three accounts show elevated churn risk: Orbit Logistics (0.82), Lumen Studio (0.61), and Bluewave Media (0.58). Orbit's login frequency dropped 64% — I'd suggest a success call this week.",
  "Based on the trailing 12 months and current pipeline, next quarter's MRR lands between $86.5k and $89.1k with 78% confidence. Upselling Nimbus Labs to Enterprise could add ~$1.5k/mo.",
  "Signup conversion is 3.82% overall, down 0.6 points. The drop is concentrated on mobile (2.1% vs 5.4% desktop) — the mobile pricing page experiment may be worth prioritizing.",
];
// Canned answers are sample data — dev builds only. Production has no AI
// endpoint yet, so the copilot says so instead of inventing revenue numbers.
const CANNED_REPLIES = DEMO_AVAILABLE ? SAMPLE_REPLIES : [];
const AI_UNAVAILABLE =
  'The AI copilot is not connected in this environment yet. Once the assistant endpoint is live, answers will be grounded in your real workspace data.';

const AIAssistant = () => {
  const theme = useTheme();
  const [thread, setThread] = React.useState([
    {
      id: 'a1', role: 'assistant',
      text: "Hi! I'm your Nexus AI copilot. I can analyze your metrics, flag risks, forecast revenue, and answer questions about your workspace in plain English. What would you like to know?",
    },
  ]);
  const [draft, setDraft] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const listRef = React.useRef(null);

  React.useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [thread, typing]);

  const send = (text) => {
    const q = (text ?? draft).trim();
    if (!q) return;
    setThread((t) => [...t, { id: `u_${Date.now()}`, role: 'user', text: q }]);
    setDraft('');
    setTyping(true);
    setTimeout(() => {
      const reply = CANNED_REPLIES.length
        ? CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)]
        : AI_UNAVAILABLE;
      setThread((t) => [...t, { id: `a_${Date.now()}`, role: 'assistant', text: reply }]);
      setTyping(false);
    }, 900 + Math.random() * 700);
  };

  return (
    <Box>
      <PageHeader
        title="AI Assistant"
        subtitle="Ask questions, catch risks early, and let the data come to you."
        actions={[
          <Chip key="beta" icon={<AutoAwesomeIcon sx={{ fontSize: '16px !important' }} />} label="Nexus AI · v2.1" color="secondary" sx={{ fontWeight: 700 }} />,
        ]}
      />

      <Grid container spacing={2.5}>
        {/* Chat */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 300px)', minHeight: 560 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #7C3AED, #6366F1)', color: '#fff',
              }}>
                <AutoAwesomeIcon fontSize="small" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={800}>Nexus Copilot</Typography>
                <Typography variant="caption" color="success.main" fontWeight={700}>● Online — knows your workspace</Typography>
              </Box>
              <Tooltip title="New conversation">
                <Button size="small" variant="outlined" sx={{ borderRadius: 2.5 }}>Reset</Button>
              </Tooltip>
            </Stack>

            <Box ref={listRef} sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 2.5 }}>
              {thread.map((m) => (
                <Stack key={m.id} direction="row" spacing={1.5} sx={{ mb: 2.5, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                  {m.role === 'assistant' ? (
                    <Box sx={{
                      width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      background: 'linear-gradient(135deg, #7C3AED, #6366F1)', color: '#fff',
                    }}>
                      <AutoAwesomeIcon fontSize="small" />
                    </Box>
                  ) : (
                    <AppAvatar name="You" size={36} />
                  )}
                  <Box sx={{ maxWidth: '78%' }}>
                    <Box sx={{
                      px: 1.85, py: 1.35, borderRadius: 2.75,
                      bgcolor: m.role === 'user' ? 'primary.main' : 'action.hover',
                      color: m.role === 'user' ? '#fff' : 'text.primary',
                      borderTopRightRadius: m.role === 'user' ? 6 : 2.75 * 4,
                      borderTopLeftRadius: m.role === 'user' ? 2.75 * 4 : 6,
                    }}>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{m.text}</Typography>
                    </Box>
                    {m.role === 'assistant' && (
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.75 }}>
                        <IconButton size="small"><ContentCopyIcon sx={{ fontSize: 15 }} /></IconButton>
                        <IconButton size="small"><ThumbUpIcon sx={{ fontSize: 15 }} /></IconButton>
                      </Stack>
                    )}
                  </Box>
                </Stack>
              ))}
              {typing && (
                <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #7C3AED, #6366F1)', color: '#fff',
                  }}>
                    <AutoAwesomeIcon fontSize="small" />
                  </Box>
                  <Box sx={{ px: 2, py: 1.4, borderRadius: 2.75, bgcolor: 'action.hover' }}>
                    <Typography variant="body2" color="text.secondary">Analyzing your data…</Typography>
                  </Box>
                </Stack>
              )}
            </Box>

            <Divider />
            {/* Suggestions */}
            <Stack direction="row" spacing={1} sx={{ px: 2, pt: 1.75, overflowX: 'auto' }}>
              {SUGGESTIONS.map((s) => (
                <Chip key={s} label={s} size="small" onClick={() => send(s)} sx={{ cursor: 'pointer', fontWeight: 600, borderRadius: 2.5 }} />
              ))}
            </Stack>
            {/* Composer */}
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ p: 2 }}>
              <TextField
                fullWidth size="small" placeholder="Ask anything about your metrics…"
                value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'action.hover' } }}
              />
              <IconButton
                color="primary" onClick={() => send()} disabled={!draft.trim() || typing}
                sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Card>
        </Grid>

        {/* Insights panel */}
        <Grid item xs={12} lg={5}>
          <Stack spacing={2.5}>
            <SectionCard title="Proactive insights" subtitle="Generated from your live data" contentSx={{ pt: 1.5 }}>
              <Stack spacing={1.75}>
                {aiInsights.map((ins) => {
                  const meta = INSIGHT_ICONS[ins.type];
                  return (
                    <Box key={ins.id} sx={{ p: 2, borderRadius: 2.75, border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.75 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: 1.75, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${meta.color}1A`, color: meta.color }}>
                          {meta.icon}
                        </Box>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ flex: 1 }}>{ins.title}</Typography>
                        <Chip size="small" label={meta.label} sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: `${meta.color}1A`, color: meta.color }} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{ins.detail}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.disabled">Confidence</Typography>
                        <Box sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: 'action.hover' }}>
                          <Box sx={{ width: `${ins.confidence * 100}%`, height: '100%', borderRadius: 3, bgcolor: meta.color }} />
                        </Box>
                        <Typography variant="caption" fontWeight={700}>{Math.round(ins.confidence * 100)}%</Typography>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </SectionCard>

            <SectionCard title="Revenue pulse" subtitle="MRR trend & mix">
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h4" fontWeight={800}>{kpis.mrr ? formatCurrency(kpis.mrr.value) : '—'}</Typography>
                  <MetricDelta value={12.4} />
                </Box>
                <Box sx={{ width: 150 }}>
                  <Sparkline data={revenueSeries.map((r) => ({ value: r.revenue }))} height={54} color="#7C3AED" />
                </Box>
              </Stack>
              <DonutChart data={revenueByPlan} height={200} innerRadius={52} showLegend />
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIAssistant;
