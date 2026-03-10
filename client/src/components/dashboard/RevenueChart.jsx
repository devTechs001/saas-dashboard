import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { Chart } from '../common';
import PropTypes from 'prop-types';

const RevenueChart = ({ data }) => {
  const formattedData = data?.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Revenue Trends
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Chart
              type="bar"
              data={formattedData || []}
              xKey="date"
              yKeys={[
                { dataKey: 'revenue', name: 'Revenue', fill: '#2e7d32' },
              ]}
              height={250}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Conversion Rate
            </Typography>
            <Chart
              type="line"
              data={formattedData || []}
              xKey="date"
              yKeys={[
                { dataKey: 'conversions', name: 'Conversions', stroke: '#1976d2' },
              ]}
              height={250}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

RevenueChart.propTypes = {
  data: PropTypes.array,
};

export default RevenueChart;
