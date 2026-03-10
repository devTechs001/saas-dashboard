import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { PageBreadcrumb, LoadingSpinner, Chart } from '../components/common';
import { useDashboardStats, useDeviceBreakdown, useTopPages } from '../hooks';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('30');

  const { data: statsData, isLoading } = useDashboardStats({
    startDate: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });

  const { data: deviceData } = useDeviceBreakdown();
  const { data: topPages } = useTopPages(10);

  if (isLoading) {
    return <LoadingSpinner message="Loading analytics..." />;
  }

  const chartData = statsData?.chartData?.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <Box>
      <PageBreadcrumb items={[{ label: 'Analytics' }]} />

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Analytics
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={dateRange}
            label="Time Range"
            onChange={(e) => setDateRange(e.target.value)}
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="14">Last 14 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Page Views
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {statsData?.totals?.pageViews?.toLocaleString() || 0}
              </Typography>
              <Typography
                variant="body2"
                color={
                  (statsData?.growth?.pageViews || 0) >= 0 ? 'success.main' : 'error.main'
                }
              >
                {(statsData?.growth?.pageViews || 0) >= 0 ? '↑' : '↓'}{' '}
                {Math.abs(statsData?.growth?.pageViews || 0).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Unique Visitors
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {statsData?.totals?.uniqueVisitors?.toLocaleString() || 0}
              </Typography>
              <Typography
                variant="body2"
                color={
                  (statsData?.growth?.uniqueVisitors || 0) >= 0 ? 'success.main' : 'error.main'
                }
              >
                {(statsData?.growth?.uniqueVisitors || 0) >= 0 ? '↑' : '↓'}{' '}
                {Math.abs(statsData?.growth?.uniqueVisitors || 0).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Sessions
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {statsData?.totals?.sessions?.toLocaleString() || 0}
              </Typography>
              <Typography
                variant="body2"
                color={
                  (statsData?.growth?.sessions || 0) >= 0 ? 'success.main' : 'error.main'
                }
              >
                {(statsData?.growth?.sessions || 0) >= 0 ? '↑' : '↓'}{' '}
                {Math.abs(statsData?.growth?.sessions || 0).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Conversions
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {statsData?.totals?.conversions?.toLocaleString() || 0}
              </Typography>
              <Typography
                variant="body2"
                color={
                  (statsData?.growth?.conversions || 0) >= 0 ? 'success.main' : 'error.main'
                }
              >
                {(statsData?.growth?.conversions || 0) >= 0 ? '↑' : '↓'}{' '}
                {Math.abs(statsData?.growth?.conversions || 0).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Traffic Trends
            </Typography>
            <Chart
              type="area"
              data={chartData || []}
              xKey="date"
              yKeys={[
                { dataKey: 'pageViews', name: 'Page Views', stroke: '#1976d2', fill: '#1976d2' },
                { dataKey: 'uniqueVisitors', name: 'Visitors', stroke: '#2e7d32', fill: '#2e7d32' },
                { dataKey: 'sessions', name: 'Sessions', stroke: '#f57c00', fill: '#f57c00' },
              ]}
              height={350}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Device Distribution
            </Typography>
            <Chart
              type="pie"
              data={[
                { name: 'Desktop', value: deviceData?.desktop?.count || 0 },
                { name: 'Mobile', value: deviceData?.mobile?.count || 0 },
                { name: 'Tablet', value: deviceData?.tablet?.count || 0 },
              ]}
              xKey="name"
              yKeys={['value']}
              height={350}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Over Time
            </Typography>
            <Chart
              type="bar"
              data={chartData || []}
              xKey="date"
              yKeys={[{ dataKey: 'revenue', name: 'Revenue', fill: '#2e7d32' }]}
              height={300}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Pages
            </Typography>
            <Box>
              {topPages?.map((page, index) => (
                <Box
                  key={page.path}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1}
                  borderBottom={index < topPages.length - 1 ? '1px solid' : 'none'}
                  borderColor="divider"
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'grey.300',
                        color: index < 3 ? '#000' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Typography variant="body2">{page.path}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {page.views.toLocaleString()} views
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
