import React from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunchOutlined';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlockIcon from '@mui/icons-material/BlockOutlined';
import { GradientText } from '../components/ui';

const NotFound = ({ code = 404, title, message }) => {
  const navigate = useNavigate();
  const denied = code === 403;

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      px: 2, bgcolor: 'background.default',
      background: 'radial-gradient(900px 420px at 50% 20%, rgba(99,102,241,0.1), transparent 65%)',
    }}>
      <Stack alignItems="center" spacing={2.5} sx={{ textAlign: 'center', maxWidth: 560 }}>
        <Box sx={{
          width: 96, height: 96, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: denied ? 'linear-gradient(135deg, #FEF2F2, transparent)' : 'linear-gradient(135deg, #EEF2FF, transparent)',
          color: denied ? '#DC2626' : '#4F46E5',
        }}>
          {denied ? <BlockIcon sx={{ fontSize: 48 }} /> : <RocketLaunchIcon sx={{ fontSize: 48 }} />}
        </Box>
        <Typography variant="h1" sx={{ fontSize: { xs: '4.5rem', md: '6.5rem' }, lineHeight: 1 }}>
          <GradientText>{code}</GradientText>
        </Typography>
        <Typography variant="h3" fontWeight={800}>
          {title || (denied ? 'Access denied' : 'Page not found')}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, lineHeight: 1.75 }}>
          {message || (denied
            ? "You don't have permission to view this page. Your role doesn't include this area — ask a workspace admin if you think this is a mistake."
            : "The page you're looking for doesn't exist or has been moved. Let's get you back on track.")}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" size="large" startIcon={<HomeIcon />} onClick={() => navigate('/dashboard')} sx={{ px: 4, borderRadius: 3 }}>
            Back to dashboard
          </Button>
          <Button variant="outlined" size="large" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ px: 4, borderRadius: 3 }}>
            Go back
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default NotFound;
