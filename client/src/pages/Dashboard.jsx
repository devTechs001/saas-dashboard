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
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { PageBreadcrumb, LoadingSpinner } from '../components/common';
import { DashboardStats, TrafficChart, RevenueChart, DeviceBreakdown, TopPages } from '../components/dashboard';
import { analyticsService } from '../services';

const Dashboard = () => {
  const [dateRange, setDateRange] = useState('30');

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats', { dateRange }],
    queryFn: () => analyticsService.getDashboardStats({ 
      startDate: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    }),
    select: (data) => data.data,
  });

  const { data: deviceData } = useQuery({
    queryKey: ['deviceBreakdown'],
    queryFn: () => analyticsService.getDeviceBreakdown(),
    select: (data) => data.data.devices,
  });

  const { data: topPagesData } = useQuery({
    queryKey: ['topPages'],
    queryFn: () => analyticsService.getTopPages(5),
    select: (data) => data.data.topPages,
  });

  if (statsLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <PageBreadcrumb items={[{ label: 'Dashboard' }]} />
          <Typography variant="h4" fontWeight="bold">
            Dashboard Overview
          </Typography>
        </Box>
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

      <DashboardStats stats={statsData?.totals} growth={statsData?.growth} />

      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} md={8} sx={{ mt: 3 }}>
          <TrafficChart data={statsData?.chartData} />
        </Grid>
        <Grid item xs={12} md={4} sx={{ mt: 3 }}>
          <DeviceBreakdown devices={deviceData} />
        </Grid>
        <Grid item xs={12} sx={{ mt: 0 }}>
          <RevenueChart data={statsData?.chartData} />
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 0 }}>
          <TopPages pages={topPagesData} />
        </Grid>
        <Grid item xs={12} md={6} sx={{ mt: 0 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Box mt={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Bounce Rate
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {statsData?.totals?.avgBounceRate || 0}%
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Session Duration
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {Math.floor((statsData?.totals?.avgSessionDuration || 0) / 60)}m{' '}
                    {(statsData?.totals?.avgSessionDuration || 0) % 60}s
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    ${statsData?.totals?.revenue?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
