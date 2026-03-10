import React from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Box, useTheme } from '@mui/material';

const Chart = ({
  type = 'line',
  data = [],
  xKey = 'name',
  yKeys = [],
  colors = ['#1976d2', '#2e7d32', '#d32f2f', '#f57c00', '#7b1fa2'],
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const renderChart = () => {
    const commonProps = {
      width: '100%',
      height,
      data,
    };

    const gridProps = showGrid ? (
      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#424242' : '#e0e0e0'} />
    ) : null;

    const tooltipProps = showTooltip ? (
      <Tooltip
        contentStyle={{
          backgroundColor: isDark ? '#424242' : '#fff',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      />
    ) : null;

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {gridProps}
            {tooltipProps}
            {showLegend && <Legend />}
            <XAxis dataKey={xKey} stroke={isDark ? '#fff' : '#666'} />
            <YAxis stroke={isDark ? '#fff' : '#666'} />
            {yKeys.map((key, index) => (
              <Bar
                key={key.dataKey || key}
                dataKey={key.dataKey || key}
                fill={key.fill || colors[index % colors.length]}
                name={key.name || key}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {gridProps}
            {tooltipProps}
            {showLegend && <Legend />}
            <XAxis dataKey={xKey} stroke={isDark ? '#fff' : '#666'} />
            <YAxis stroke={isDark ? '#fff' : '#666'} />
            {yKeys.map((key, index) => (
              <Area
                key={key.dataKey || key}
                type="monotone"
                dataKey={key.dataKey || key}
                stroke={key.stroke || colors[index % colors.length]}
                fill={key.fill || colors[index % colors.length]}
                fillOpacity={0.3}
                name={key.name || key}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            {tooltipProps}
            {showLegend && <Legend />}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={height / 2 - 20}
              fill="#8884d8"
              dataKey={yKeys[0]?.dataKey || yKeys[0] || 'value'}
              nameKey={xKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            {gridProps}
            {tooltipProps}
            {showLegend && <Legend />}
            <XAxis dataKey={xKey} stroke={isDark ? '#fff' : '#666'} />
            <YAxis stroke={isDark ? '#fff' : '#666'} />
            {yKeys.map((key, index) => (
              <Line
                key={key.dataKey || key}
                type="monotone"
                dataKey={key.dataKey || key}
                stroke={key.stroke || colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                name={key.name || key}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
    </Box>
  );
};

Chart.propTypes = {
  type: PropTypes.oneOf(['line', 'bar', 'pie', 'area']),
  data: PropTypes.array,
  xKey: PropTypes.string,
  yKeys: PropTypes.array,
  colors: PropTypes.array,
  height: PropTypes.number,
  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  showTooltip: PropTypes.bool,
};

export default Chart;
