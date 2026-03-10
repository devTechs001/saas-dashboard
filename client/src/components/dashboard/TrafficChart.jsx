import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Chart } from '../common';
import PropTypes from 'prop-types';

const TrafficChart = ({ data }) => {
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
          Traffic Overview
        </Typography>
        <Box sx={{ height: 300 }}>
          <Chart
            type="area"
            data={formattedData || []}
            xKey="date"
            yKeys={[
              { dataKey: 'pageViews', name: 'Page Views', stroke: '#1976d2', fill: '#1976d2' },
              { dataKey: 'uniqueVisitors', name: 'Visitors', stroke: '#2e7d32', fill: '#2e7d32' },
              { dataKey: 'sessions', name: 'Sessions', stroke: '#f57c00', fill: '#f57c00' },
            ]}
            height={300}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

TrafficChart.propTypes = {
  data: PropTypes.array,
};

export default TrafficChart;
