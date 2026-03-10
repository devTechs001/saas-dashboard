import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, icon, change, changeType = 'neutral' }) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'success.main';
    if (changeType === 'negative') return 'error.main';
    return 'text.secondary';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return '↑';
    if (changeType === 'negative') return '↓';
    return '';
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            {change !== undefined && (
              <Typography
                variant="body2"
                color={getChangeColor()}
                display="flex"
                alignItems="center"
                gap={0.5}
              >
                {getChangeIcon()} {Math.abs(change)}%
              </Typography>
            )}
          </Box>
          {icon && (
            <Box fontSize={40} color="primary.main">
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  change: PropTypes.number,
  changeType: PropTypes.oneOf(['positive', 'negative', 'neutral']),
};

export default StatCard;
