import React, { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress, Stack, useTheme } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunchOutlined';

const TIPS = [
  'Preparing your workspace…',
  'Syncing real-time metrics…',
  'Warming up the AI copilot…',
  'Almost ready…',
];

const Splash = ({ duration = 2500, onComplete, mode = 'light' }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const dark = mode === 'dark';

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 500);
        }, 250);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const tip = TIPS[Math.min(TIPS.length - 1, Math.floor((progress / 100) * TIPS.length))];

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease',
        background: dark
          ? 'radial-gradient(900px 500px at 50% 30%, rgba(99,102,241,0.25), transparent 65%), linear-gradient(160deg, #0B1020 0%, #111731 100%)'
          : 'radial-gradient(900px 500px at 50% 30%, rgba(99,102,241,0.18), transparent 65%), linear-gradient(160deg, #EEF2FF 0%, #F6F7FB 55%, #FFFFFF 100%)',
      }}
    >
      {/* Brand mark with float animation */}
      <Box
        sx={{
          width: 108,
          height: 108,
          borderRadius: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
          boxShadow: '0 24px 60px rgba(99,102,241,0.5)',
          animation: 'splashFloat 2.4s ease-in-out infinite',
          '@keyframes splashFloat': {
            '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
            '50%': { transform: 'translateY(-12px) rotate(2deg)' },
          },
        }}
      >
        <RocketLaunchIcon sx={{ fontSize: 56, color: '#fff' }} />
      </Box>

      <Typography
        variant="h2"
        sx={{
          mt: 3.5,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: dark ? '#E7ECF6' : '#0F172A',
          animation: 'splashFade 0.8s ease both',
          '@keyframes splashFade': {
            from: { opacity: 0, transform: 'translateY(10px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        Nexus
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.75, color: dark ? '#94A3B8' : '#5B6478', fontWeight: 500 }}>
        Analytics · CRM · AI Copilot
      </Typography>

      {/* Progress */}
      <Box sx={{ width: 240, mt: 4.5 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: dark ? 'rgba(148,163,184,0.18)' : 'rgba(99,102,241,0.14)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: 'linear-gradient(90deg, #6366F1, #A78BFA)',
            },
          }}
        />
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.25 }}>
          <Typography variant="caption" sx={{ color: dark ? '#94A3B8' : '#5B6478' }}>{tip}</Typography>
          <Typography variant="caption" sx={{ color: dark ? '#94A3B8' : '#5B6478', fontWeight: 700 }}>
            {Math.round(progress)}%
          </Typography>
        </Stack>
      </Box>

      <Typography variant="caption" sx={{ position: 'absolute', bottom: 28, color: dark ? '#64748B' : '#94A3B8' }}>
        © {new Date().getFullYear()} Nexus SaaS Platform
      </Typography>
    </Box>
  );
};

export default Splash;
