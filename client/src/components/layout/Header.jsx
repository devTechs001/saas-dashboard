import React from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem, Divider,
  useTheme, InputBase, Paper, Stack, Chip, Tooltip, Badge, Button, Fade, ClickAwayListener,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PaletteIcon from '@mui/icons-material/PaletteOutlined';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import ChatIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import PeopleIcon from '@mui/icons-material/PeopleAltOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMode, toggleMobileSidebar, setAccent } from '../../store/slices/themeSlice';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services';
import { AppAvatar, RoleChip } from '../ui';
import { ACCENTS } from '../../theme';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from './Sidebar';
import NotificationsDrawer from './NotificationsDrawer';

const QUICK_LINKS = [
  { label: 'Dashboard', to: '/dashboard', icon: <SearchIcon fontSize="small" /> },
  { label: 'Customers', to: '/customers', icon: <PeopleIcon fontSize="small" /> },
  { label: 'Analytics', to: '/analytics', icon: <AutoAwesomeIcon fontSize="small" /> },
  { label: 'Reports', to: '/reports', icon: <DescriptionIcon fontSize="small" /> },
  { label: 'Team Chat', to: '/chat', icon: <ChatIcon fontSize="small" /> },
  { label: 'AI Assistant', to: '/ai', icon: <AutoAwesomeIcon fontSize="small" /> },
  { label: 'Billing', to: '/billing', icon: <CreditCardIcon fontSize="small" /> },
  { label: 'Settings', to: '/settings', icon: <SettingsIcon fontSize="small" /> },
];

const Header = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sidebarOpen = useSelector((state) => state.theme.sidebarOpen);
  const accent = useSelector((state) => state.theme.accent);
  const user = useSelector((state) => state.auth.user);

  const [profileAnchor, setProfileAnchor] = React.useState(null);
  const [themeAnchor, setThemeAnchor] = React.useState(null);
  const [quickAnchor, setQuickAnchor] = React.useState(null);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [searchFocused, setSearchFocused] = React.useState(false);

  const results = search.trim()
    ? QUICK_LINKS.filter((l) => l.label.toLowerCase().includes(search.trim().toLowerCase()))
    : QUICK_LINKS.slice(0, 5);

  const handleLogout = () => { authService.logout(); navigate('/login'); };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { xs: '100%', md: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH}px)` },
          ml: { xs: 0, md: `${sidebarOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: theme.transitions.create(['width', 'margin'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }),
        }}
      >
        <Toolbar sx={{ gap: 1.5, minHeight: { xs: 64, sm: 70 } }}>
          <IconButton edge="start" color="inherit" aria-label="Open navigation menu" data-testid="nav-toggle" sx={{ display: { md: 'none' } }} onClick={() => dispatch(toggleMobileSidebar())}>
            <MenuIcon />
          </IconButton>

          {/* Global search */}
          <ClickAwayListener onClickAway={() => setSearchFocused(false)}>
            <Box sx={{ position: 'relative', width: { xs: '100%', sm: 320 }, display: { xs: 'none', sm: 'block' } }}>
              <Paper
                elevation={0}
                onClick={() => setSearchFocused(true)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, px: 1.75, py: 0.75, borderRadius: 3,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(148,163,184,0.10)' : 'rgba(15,23,42,0.045)',
                  border: '1px solid', borderColor: searchFocused ? 'primary.main' : 'transparent',
                }}
              >
                <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <InputBase
                  placeholder="Search pages, customers, reports…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  sx={{ flex: 1, fontSize: 13.5 }}
                />
                <Chip size="small" label="⌘K" sx={{ height: 20, fontSize: 10, color: 'text.secondary', bgcolor: 'transparent', border: '1px solid', borderColor: 'divider' }} />
              </Paper>
              <Fade in={searchFocused}>
                <Paper sx={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 20, borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                  <Typography variant="overline" color="text.secondary" sx={{ px: 2, pt: 1.5, display: 'block' }}>
                    {search.trim() ? 'Results' : 'Quick navigation'}
                  </Typography>
                  {results.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>No matches for “{search}”</Typography>
                  )}
                  {results.map((r) => (
                    <MenuItem
                      key={r.to}
                      onClick={() => { setSearchFocused(false); setSearch(''); navigate(r.to); }}
                      sx={{ gap: 1.5, borderRadius: 2, mx: 1, mb: 0.5 }}
                    >
                      <Box sx={{ color: 'primary.main', display: 'flex' }}>{r.icon}</Box>
                      {r.label}
                    </MenuItem>
                  ))}
                </Paper>
              </Fade>
            </Box>
          </ClickAwayListener>

          <Box sx={{ flexGrow: 1 }} />

          {/* Quick create */}
          <Tooltip title="Quick create">
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={(e) => setQuickAnchor(e.currentTarget)}
              sx={{ display: { xs: 'none', sm: 'inline-flex' }, borderRadius: 2.5, px: 1.75 }}
            >
              New
            </Button>
          </Tooltip>
          <Menu anchorEl={quickAnchor} open={Boolean(quickAnchor)} onClose={() => setQuickAnchor(null)} PaperProps={{ sx: { borderRadius: 3, minWidth: 210, mt: 1 } }}>
            <MenuItem onClick={() => { setQuickAnchor(null); navigate('/reports'); }}><DescriptionIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />New report</MenuItem>
            <MenuItem onClick={() => { setQuickAnchor(null); navigate('/customers'); }}><PeopleIcon fontSize="small" sx={{ mr: 1.5, color: 'success.main' }} />Add customer</MenuItem>
            <MenuItem onClick={() => { setQuickAnchor(null); navigate('/team'); }}><PeopleIcon fontSize="small" sx={{ mr: 1.5, color: 'warning.main' }} />Invite teammate</MenuItem>
            <MenuItem onClick={() => { setQuickAnchor(null); navigate('/ai'); }}><AutoAwesomeIcon fontSize="small" sx={{ mr: 1.5, color: 'secondary.main' }} />Ask AI</MenuItem>
          </Menu>

          {/* Theme + accent menu */}
          <Tooltip title="Appearance">
            <IconButton onClick={(e) => setThemeAnchor(e.currentTarget)}><PaletteIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Menu anchorEl={themeAnchor} open={Boolean(themeAnchor)} onClose={() => setThemeAnchor(null)} PaperProps={{ sx: { borderRadius: 3, minWidth: 230, mt: 1 } }}>
            <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
              <Typography variant="overline" color="text.secondary">Mode</Typography>
            </Box>
            <MenuItem onClick={() => dispatch(toggleMode())} sx={{ gap: 1.5 }}>
              {theme.palette.mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              {theme.palette.mode === 'dark' ? 'Light mode' : 'Dark mode'}
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ px: 2, pb: 1 }}>
              <Typography variant="overline" color="text.secondary">Accent</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {Object.entries(ACCENTS).map(([key, a]) => (
                  <Box
                    key={key}
                    onClick={() => { dispatch(setAccent(key)); setThemeAnchor(null); }}
                    sx={{
                      width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                      background: `linear-gradient(135deg, ${a.main}, ${a.dark})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: accent === key ? '2px solid' : '2px solid transparent', borderColor: accent === key ? 'text.primary' : 'transparent',
                      color: '#fff',
                    }}
                  >
                    {accent === key && <CheckIcon sx={{ fontSize: 16 }} />}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Menu>

          {/* Dark toggle */}
          <Tooltip title={theme.palette.mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={() => dispatch(toggleMode())}>
              {theme.palette.mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton onClick={() => setNotifOpen(true)}>
              <Badge badgeContent={3} color="error" variant="dot">
                <NotificationsNoneIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile */}
          <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} aria-label="Account menu" data-testid="account-menu" sx={{ p: 0.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AppAvatar name={user?.name || 'Demo User'} size={34} />
            </Stack>
          </IconButton>
          <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={() => setProfileAnchor(null)} PaperProps={{ sx: { borderRadius: 3, minWidth: 250, mt: 1 } }}>
            <Box sx={{ px: 2, py: 1.25 }}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <AppAvatar name={user?.name || 'Demo User'} size={42} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>{user?.name || 'Demo User'}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email || 'user@nexus.io'}</Typography>
                  <Box sx={{ mt: 0.5 }}><RoleChip role={user?.role || 'admin'} /></Box>
                </Box>
              </Stack>
            </Box>
            <Divider />
            <MenuItem onClick={() => { setProfileAnchor(null); navigate('/profile'); }}><PersonIcon fontSize="small" sx={{ mr: 1.5 }} />My profile</MenuItem>
            <MenuItem onClick={() => { setProfileAnchor(null); navigate('/settings'); }}><SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />Settings</MenuItem>
            <MenuItem onClick={() => { setProfileAnchor(null); navigate('/billing'); }}><CreditCardIcon fontSize="small" sx={{ mr: 1.5 }} />Billing &amp; plan</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}><LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />Log out</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
};

export default Header;
