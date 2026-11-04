import React from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, IconButton, useTheme, Stack, Chip, Tooltip, Collapse,
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import PeopleIcon from '@mui/icons-material/PeopleAltOutlined';
import AssessmentIcon from '@mui/icons-material/InsightsOutlined';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import AdminPanelIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CodeIcon from '@mui/icons-material/CodeOutlined';
import GroupWorkIcon from '@mui/icons-material/GroupWorkOutlined';
import ChatIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlineOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunchOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../store/slices/themeSlice';
import { authService } from '../../services';
import { can, PERMISSIONS } from '../../utils/rbac';
import { AppAvatar } from '../ui';

export const DRAWER_WIDTH = 260;
export const MINI_DRAWER_WIDTH = 68;

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', permission: PERMISSIONS.DASHBOARD_VIEW },
      { text: 'Analytics', icon: <AssessmentIcon />, path: '/analytics', permission: PERMISSIONS.ANALYTICS_VIEW },
      { text: 'Reports', icon: <DescriptionIcon />, path: '/reports', permission: PERMISSIONS.REPORTS_VIEW },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { text: 'Customers', icon: <PeopleIcon />, path: '/customers', permission: PERMISSIONS.CUSTOMERS_VIEW },
      { text: 'Workspaces', icon: <GroupWorkIcon />, path: '/workspaces', permission: PERMISSIONS.TEAM_VIEW },
      { text: 'Manager Dashboard', icon: <AssessmentIcon />, path: '/manager', permission: PERMISSIONS.TEAM_MANAGE },
      { text: 'Collaboration', icon: <PeopleIcon />, path: '/team', permission: PERMISSIONS.TEAM_VIEW },
      { text: 'Team Chat', icon: <ChatIcon />, path: '/chat', permission: PERMISSIONS.CHAT_USE, badge: 8 },
      { text: 'AI Assistant', icon: <AutoAwesomeIcon />, path: '/ai', permission: PERMISSIONS.AI_USE, badge: 'AI' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { text: 'Billing', icon: <CreditCardIcon />, path: '/billing', permission: PERMISSIONS.BILLING_VIEW },
      { text: 'Developers', icon: <CodeIcon />, path: '/developers', permission: PERMISSIONS.DEVELOPERS_VIEW },
      { text: 'Admin', icon: <AdminPanelIcon />, path: '/admin', permission: PERMISSIONS.ADMIN_USERS, badge: 8 },
    ],
  },
  {
    label: 'Account',
    items: [
      { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/settings', permission: PERMISSIONS.SETTINGS_VIEW },
    ],
  },
];

/**
 * The sidebar's inner content (brand, nav, user footer).
 * Rendered directly inside a parent <Drawer> (mobile), or inside the
 * permanent desktop <Drawer> wrapper below. Keeping the content separate
 * from the Drawer avoids the nested-Drawer bug that left the mobile
 * menu empty.
 */
export const SidebarContent = ({ isOpen = true, showCollapse = false, onNavigate }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarOpen = useSelector((state) => state.theme.sidebarOpen);
  const user = useSelector((state) => state.auth.user);
  const [openSections, setOpenSections] = React.useState({ Overview: true, Workspace: true, Platform: true, Account: true });

  const toggleSection = (label) => setOpenSections((s) => ({ ...s, [label]: !s[label] }));

  const handleLogout = () => {
    authService.logout();
    if (onNavigate) onNavigate();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: isOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH }}>
      {/* Brand */}
      <Box sx={{
        display: 'flex', alignItems: 'center',
        justifyContent: isOpen ? 'space-between' : 'center',
        px: 1.5, py: 1.75, minHeight: 64, flexShrink: 0,
      }}>
        {isOpen && (
          <Stack component={Link} to="/dashboard" onClick={onNavigate} direction="row" spacing={1.25} alignItems="center" sx={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 2.25, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: '#fff',
            }}>
              <RocketLaunchIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} lineHeight={1.1}>Nexus</Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1}>SaaS Platform</Typography>
            </Box>
          </Stack>
        )}
        {showCollapse && (
          <IconButton size="small" onClick={() => dispatch(toggleSidebar())}>
            {sidebarOpen ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>

      {/* Nav */}
      <Box sx={{ overflow: 'auto', flex: 1, pb: 1 }}>
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter((item) => !item.permission || can(user, item.permission));
          if (!items.length) return null;
          return (
            <React.Fragment key={section.label}>
              {isOpen && (
                <ListItemButton onClick={() => toggleSection(section.label)} sx={{ mx: 2, mt: 1, mb: 0.25, py: 0.4, '&:hover': { bgcolor: 'transparent' } }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1, flex: 1 }}>
                    {section.label}
                  </Typography>
                  {openSections[section.label] ? <ExpandLess sx={{ fontSize: 16, color: 'text.secondary' }} /> : <ExpandMore sx={{ fontSize: 16, color: 'text.secondary' }} />}
                </ListItemButton>
              )}
              <Collapse in={!isOpen || openSections[section.label]} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {items.map((item) => {
                    const selected = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));
                    const button = (
                      <ListItemButton
                        component={Link}
                        to={item.path}
                        selected={selected}
                        onClick={onNavigate}
                        sx={{
                          minHeight: 44,
                          justifyContent: isOpen ? 'initial' : 'center',
                          px: 2.25,
                          color: selected ? 'primary.main' : 'text.primary',
                          fontWeight: selected ? 700 : 500,
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 1.75 : 'auto', justifyContent: 'center', color: 'inherit' }}>
                          {item.icon}
                        </ListItemIcon>
                        {isOpen && <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 13.5, fontWeight: selected ? 700 : 500 }} />}
                        {isOpen && item.badge && (
                          <Chip size="small" label={item.badge} sx={{ height: 20, fontSize: 10.5, fontWeight: 700, bgcolor: item.badge === 'AI' ? 'secondary.main' : 'error.main', color: '#fff' }} />
                        )}
                      </ListItemButton>
                    );
                    return (
                      <ListItem key={item.text} disablePadding>
                        {isOpen ? button : <Tooltip title={item.text} placement="right">{button}</Tooltip>}
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </React.Fragment>
          );
        })}
      </Box>

      {/* User + logout */}
      <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        {isOpen ? (
          <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="space-between">
            <Stack component={Link} to="/profile" onClick={onNavigate} direction="row" spacing={1.25} alignItems="center" sx={{ textDecoration: 'none', color: 'inherit', minWidth: 0 }}>
              <AppAvatar name={user?.name || 'User'} size={36} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} noWrap>{user?.name || 'Demo User'}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>{user?.email || 'user@nexus.io'}</Typography>
              </Box>
            </Stack>
            <Tooltip title="Log out">
              <IconButton size="small" onClick={handleLogout}><LogoutIcon fontSize="small" /></IconButton>
            </Tooltip>
          </Stack>
        ) : (
          <Stack alignItems="center" spacing={1}>
            <AppAvatar name={user?.name || 'User'} size={34} />
            <Tooltip title="Log out" placement="right">
              <IconButton size="small" onClick={handleLogout}><LogoutIcon fontSize="small" /></IconButton>
            </Tooltip>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

/** Desktop: permanent, collapsible drawer. */
const Sidebar = () => {
  const theme = useTheme();
  const sidebarOpen = useSelector((state) => state.theme.sidebarOpen);
  const width = sidebarOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }),
          overflowX: 'hidden',
          bgcolor: 'background.paper',
        },
      }}
    >
      <SidebarContent isOpen={sidebarOpen} showCollapse />
    </Drawer>
  );
};

export default Sidebar;
