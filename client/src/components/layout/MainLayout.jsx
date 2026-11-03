import React from 'react';
import { Box, Drawer, useTheme, useMediaQuery } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { setMobileSidebarOpen } from '../../store/slices/themeSlice';
import Sidebar, { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const mobileSidebarOpen = useSelector((state) => state.theme.mobileSidebarOpen);
  const sidebarOpen = useSelector((state) => state.theme.sidebarOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Desktop sidebar */}
      {!isMobile && <Sidebar variant="permanent" />}

      {/* Mobile drawer nav */}
      <Drawer
        open={isMobile && mobileSidebarOpen}
        onClose={() => dispatch(setMobileSidebarOpen(false))}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Sidebar variant="temporary" onNavigate={() => dispatch(setMobileSidebarOpen(false))} />
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
        <Box sx={{ flex: 1, width: '100%', maxWidth: 1440, mx: 'auto' }}>{children}</Box>
        <Footer compact />
      </Box>
    </Box>
  );
};

export default MainLayout;
