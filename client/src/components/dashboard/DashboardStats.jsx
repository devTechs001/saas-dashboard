import React from 'react';
import { Grid } from '@mui/material';
import { StatCard } from '../common';
import PropTypes from 'prop-types';

const DashboardStats = ({ stats, growth }) => {
  if (!stats) return null;

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getChangeType = (value) => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={2.4}>
        <StatCard
          title="Page Views"
          value={formatNumber(stats.pageViews)}
          icon="👁"
          change={growth?.pageViews}
          changeType={getChangeType(growth?.pageViews)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <StatCard
          title="Visitors"
          value={formatNumber(stats.uniqueVisitors)}
          icon="👥"
          change={growth?.uniqueVisitors}
          changeType={getChangeType(growth?.uniqueVisitors)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <StatCard
          title="Sessions"
          value={formatNumber(stats.sessions)}
          icon="📱"
          change={growth?.sessions}
          changeType={getChangeType(growth?.sessions)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <StatCard
          title="Conversions"
          value={formatNumber(stats.conversions)}
          icon="🎯"
          change={growth?.conversions}
          changeType={getChangeType(growth?.conversions)}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.revenue)}
          icon="💰"
          change={growth?.revenue}
          changeType={getChangeType(growth?.revenue)}
        />
      </Grid>
    </Grid>
  );
};

DashboardStats.propTypes = {
  stats: PropTypes.shape({
    pageViews: PropTypes.number,
    uniqueVisitors: PropTypes.number,
    sessions: PropTypes.number,
    conversions: PropTypes.number,
    revenue: PropTypes.number,
  }),
  growth: PropTypes.shape({
    pageViews: PropTypes.number,
    uniqueVisitors: PropTypes.number,
    sessions: PropTypes.number,
    conversions: PropTypes.number,
    revenue: PropTypes.number,
  }),
};

export default DashboardStats;
