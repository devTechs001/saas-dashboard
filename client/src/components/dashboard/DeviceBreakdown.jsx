import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import PropTypes from 'prop-types';

const DeviceBreakdown = ({ devices }) => {
  if (!devices) return null;

  const deviceList = [
    { name: 'Desktop', ...devices.desktop, icon: '🖥️' },
    { name: 'Mobile', ...devices.mobile, icon: '📱' },
    { name: 'Tablet', ...devices.tablet, icon: '📲' },
  ];

  const total = deviceList.reduce((acc, d) => acc + (d.count || 0), 0);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Device Breakdown
        </Typography>
        <Box sx={{ mt: 2 }}>
          {deviceList.map((device) => (
            <Box key={device.name} sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">
                  {device.icon} {device.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {device.count?.toLocaleString()} ({device.percentage?.toFixed(1)}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={device.percentage || 0}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          ))}
        </Box>
        <Box mt={2} p={2} bgcolor="background.default" borderRadius={1}>
          <Typography variant="body2" color="text.secondary">
            Total Sessions: {total.toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

DeviceBreakdown.propTypes = {
  devices: PropTypes.shape({
    desktop: PropTypes.shape({
      count: PropTypes.number,
      percentage: PropTypes.number,
    }),
    mobile: PropTypes.shape({
      count: PropTypes.number,
      percentage: PropTypes.number,
    }),
    tablet: PropTypes.shape({
      count: PropTypes.number,
      percentage: PropTypes.number,
    }),
  }),
};

export default DeviceBreakdown;
