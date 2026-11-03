import React from 'react';
import {
  AppBar, Toolbar, Box, Button, Stack, IconButton, Typography, useTheme,
  MenuItem, Menu, Drawer, List, ListItemButton, ListItemText, Divider, Tooltip,
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunchOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMode } from '../../store/slices/themeSlice';
import { authService } from '../../services';

const LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const LandingNav = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(11,16,32,0.82)' : 'rgba(255,255,255,0.82)', backdropFilter: 'blur(14px)', borderBottom: '1px solid', borderColor: 'divider', color: 'text.primary' }}>
        <Toolbar sx={{ maxWidth: 1280, mx: 'auto', width: '100%', gap: 2, minHeight: { xs: 64, md: 72 } }}>
          <Stack component={Link} to="/" direction="row" spacing={1.25} alignItems="center" sx={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: 2.25, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: '#fff',
            }}>
              <RocketLaunchIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} lineHeight={1.1}>Nexus</Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1}>SaaS Platform</Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' }, ml: 3 }}>
            {LINKS.map((l) => (
              <Button
                key={l.to}
                component={Link}
                to={l.to}
                color="inherit"
                sx={{
                  borderRadius: 2.5, px: 1.75,
                  fontWeight: location.pathname === l.to ? 700 : 500,
                  bgcolor: location.pathname === l.to ? 'action.selected' : 'transparent',
                }}
              >
                {l.label}
              </Button>
            ))}
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title={theme.palette.mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={() => dispatch(toggleMode())} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
              {theme.palette.mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {isAuthenticated ? (
            <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
              Open dashboard
            </Button>
          ) : (
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Button color="inherit" onClick={() => navigate('/login')} sx={{ fontWeight: 600 }}>Sign in</Button>
              <Button variant="contained" onClick={() => navigate('/register')}>Get started</Button>
            </Stack>
          )}

          <IconButton sx={{ display: { md: 'none' } }} onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile menu */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" fontWeight={800}>Menu</Typography>
            <IconButton onClick={() => setMobileOpen(false)}><CloseIcon /></IconButton>
          </Stack>
          <Divider sx={{ mb: 1 }} />
          <List>
            {LINKS.map((l) => (
              <ListItemButton key={l.to} component={Link} to={l.to} onClick={() => setMobileOpen(false)} selected={location.pathname === l.to} sx={{ borderRadius: 2 }}>
                <ListItemText primary={l.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 1.5 }} />
          <Stack spacing={1}>
            <Button fullWidth variant="outlined" onClick={() => { setMobileOpen(false); navigate('/login'); }}>Sign in</Button>
            <Button fullWidth variant="contained" onClick={() => { setMobileOpen(false); navigate('/register'); }}>Get started free</Button>
            <Button fullWidth color="inherit" startIcon={theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />} onClick={() => dispatch(toggleMode())}>
              {theme.palette.mode === 'dark' ? 'Light mode' : 'Dark mode'}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};

export default LandingNav;
