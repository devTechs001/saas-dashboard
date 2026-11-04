import React from 'react';
import { Box, Drawer, useTheme, useMediaQuery } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { setMobileSidebarOpen } from '../../store/slices/themeSlice';
import { MaintenanceBanner } from '../common';
import Sidebar, { SidebarContent, DRAWER_WIDTH, MINI_DRAWER_WIDTH } from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const mobileSidebarOpen = useSelector((state) => state.theme.mobileSidebarOpen);
  const sidebarOpen = useSelector((state) => state.theme.sidebarOpen);

  const handleCloseMobileSidebar = () => dispatch(setMobileSidebarOpen(false));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Desktop sidebar (permanent drawer) */}
      {!isMobile && <Sidebar />}

      {/* Mobile drawer nav — one Drawer only, SidebarContent lives directly inside it */}
      <Drawer
        variant="temporary"
        open={Boolean(isMobile && mobileSidebarOpen)}
        onClose={handleCloseMobileSidebar}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
          },
        }}
      >
        <SidebarContent isOpen onNavigate={handleCloseMobileSidebar} />
      </Drawer>

      <Header />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          pt: { xs: 10, md: 11 },
          width: {
            xs: '100%',
            md: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH}px)`,
          },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flex: 1, width: '100%', maxWidth: 1440, mx: 'auto', pt: 2 }}>
          <MaintenanceBanner />
          {children}
        </Box>
        <Footer compact />
      </Box>
    </Box>
  );
};

export default MainLayout;
