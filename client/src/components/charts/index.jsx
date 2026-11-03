import React from 'react';
import { Box, Typography, Stack, useTheme } from '@mui/material';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ComposedChart,
} from 'recharts';

export const CHART_COLORS = ['#4F46E5', '#0EA5E9', '#34D399', '#F59E0B', '#F43F5E', '#8B5CF6', '#14B8A6', '#F97316'];

const axisStyle = (theme) => ({
  fontSize: 11,
  fill: theme.palette.text.secondary,
  tickLine: false,
  axisLine: { stroke: theme.palette.divider },
});

const tooltipStyle = (theme) => ({
  contentStyle: {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    fontSize: 12,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[4],
  },
  labelStyle: { color: theme.palette.text.secondary },
});

const LegendView = ({ payload }) => (
  <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ mt: 1 }}>
    {payload?.map((entry) => (
      <Stack key={entry.value} direction="row" spacing={0.7} alignItems="center">
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.color }} />
        <Typography variant="caption" color="text.secondary">{entry.value}</Typography>
      </Stack>
    ))}
  </Stack>
);

/* ---------- Area trend (revenue, traffic) ---------- */
export const AreaTrendChart = ({ data, xKey = 'month', series = [{ key: 'revenue', name: 'Revenue', color: '#4F46E5' }], height = 280, formatValue }) => {
  const theme = useTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle(theme)} />
        <YAxis tick={axisStyle(theme)} tickFormatter={formatValue} />
        <Tooltip {...tooltipStyle(theme)} formatter={(v) => (formatValue ? formatValue(v) : v)} />
        {series.map((s) => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.5} fill={`url(#grad-${s.key})`} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

/* ---------- Multi-line chart ---------- */
export const MultiLineChart = ({ data, xKey = 'month', series, height = 280, formatValue }) => {
  const theme = useTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle(theme)} />
        <YAxis tick={axisStyle(theme)} tickFormatter={formatValue} />
        <Tooltip {...tooltipStyle(theme)} formatter={(v) => (formatValue ? formatValue(v) : v)} />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.5} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

/* ---------- Vertical bars ---------- */
export const BarTrendChart = ({ data, xKey = 'month', series, height = 280, formatValue, stacked }) => {
  const theme = useTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle(theme)} />
        <YAxis tick={axisStyle(theme)} tickFormatter={formatValue} />
        <Tooltip {...tooltipStyle(theme)} formatter={(v) => (formatValue ? formatValue(v) : v)} cursor={{ fill: theme.palette.action.hover }} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[6, 6, 0, 0]} stackId={stacked ? 'stack' : undefined} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

/* ---------- Revenue vs expenses composed ---------- */
export const ComposedTrendChart = ({ data, xKey = 'month', barKey = 'expenses', lineKey = 'revenue', height = 280, formatValue }) => {
  const theme = useTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
        <XAxis dataKey={xKey} tick={axisStyle(theme)} />
        <YAxis tick={axisStyle(theme)} tickFormatter={formatValue} />
        <Tooltip {...tooltipStyle(theme)} formatter={(v) => (formatValue ? formatValue(v) : v)} />
        <Legend content={<LegendView />} />
        <Bar dataKey={barKey} name="Expenses" fill="#0EA5E9" radius={[6, 6, 0, 0]} barSize={18} />
        <Line type="monotone" dataKey={lineKey} name="Revenue" stroke="#4F46E5" strokeWidth={3} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

/* ---------- Donut / pie ---------- */
export const DonutChart = ({ data, height = 260, innerRadius = 68, showLegend = true, centerLabel, centerValue }) => {
  const theme = useTheme();
  return (
    <Box>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
            innerRadius={innerRadius} outerRadius={innerRadius + 26} paddingAngle={3} strokeWidth={0}>
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle(theme)} />
          {centerLabel && (
            <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 20, fontWeight: 800, fill: theme.palette.text.primary }}>
              {centerValue}
            </text>
          )}
          {centerLabel && (
            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 11, fill: theme.palette.text.secondary }}>
              {centerLabel}
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>
      {showLegend && <LegendView payload={data.map((d) => ({ value: d.name, color: d.color || CHART_COLORS[data.indexOf(d) % CHART_COLORS.length] }))} />}
    </Box>
  );
};

/* ---------- Radial progress gauge ---------- */
export const RadialGauge = ({ value, max = 100, label, color = '#4F46E5', height = 200 }) => {
  const theme = useTheme();
  const pct = Math.min(100, (value / max) * 100);
  return (
    <Box sx={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="72%" outerRadius="100%" barSize={14}
          data={[{ name: label, value: pct, fill: color }]} startAngle={90} endAngle={-270}>
          <RadialBar dataKey="value" cornerRadius={10} background={{ fill: theme.palette.action.hover }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <Typography variant="h5" fontWeight={800}>{Math.round(pct)}%</Typography>
        {label && <Typography variant="caption" color="text.secondary">{label}</Typography>}
      </Box>
    </Box>
  );
};

/* ---------- Horizontal bars (traffic sources, top pages) ---------- */
export const HorizontalBarList = ({ data, xKey = 'value', nameKey = 'name', height = 280, formatValue, colors = CHART_COLORS }) => {
  const theme = useTheme();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
        <XAxis type="number" tick={axisStyle(theme)} tickFormatter={formatValue} />
        <YAxis type="category" dataKey={nameKey} tick={axisStyle(theme)} width={110} />
        <Tooltip {...tooltipStyle(theme)} formatter={(v) => (formatValue ? formatValue(v) : v)} cursor={{ fill: theme.palette.action.hover }} />
        <Bar dataKey={xKey} radius={[0, 6, 6, 0]} barSize={16}>
          {data.map((entry, i) => (
            <Cell key={entry[nameKey]} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

/* ---------- Funnel-style horizontal bars ---------- */
export const FunnelBars = ({ data, height = 300 }) => {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6, justifyContent: 'center', minHeight: height }}>
      {data.map((step, i) => {
        const pct = (step.value / max) * 100;
        const conv = i > 0 ? ((step.value / data[i - 1].value) * 100).toFixed(1) : null;
        return (
          <Box key={step.stage}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.4 }}>
              <Typography variant="body2" fontWeight={600}>{step.stage}</Typography>
              <Stack direction="row" spacing={1.5}>
                {conv && <Typography variant="caption" color="text.secondary">{conv}% ↓</Typography>}
                <Typography variant="caption" fontWeight={700}>{step.value.toLocaleString()}</Typography>
              </Stack>
            </Stack>
            <Box sx={{ height: 12, borderRadius: 6, bgcolor: 'action.hover', overflow: 'hidden' }}>
              <Box sx={{
                width: `${pct}%`, height: '100%', borderRadius: 6,
                background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[(i + 1) % CHART_COLORS.length]})`,
              }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

/* ---------- Tiny sparkline ---------- */
export const Sparkline = ({ data, dataKey = 'value', color = '#4F46E5', height = 48 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill="url(#spark-grad)" />
    </AreaChart>
  </ResponsiveContainer>
);
