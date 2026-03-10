import React from 'react';
import { Box, Drawer, useTheme, useMediaQuery } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { setMobileSidebarOpen } from '../../store/slices/themeSlice.js';
import Sidebar from './Sidebar.js';
import Header from './Header.js';

const DRAWER_WIDTH = 240;
const MINI_DRAWER_WIDTH = 60;

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const mobileSidebarOpen = useSelector((state) => state.theme.mobileSidebarOpen);
  const sidebarOpen = useSelector((state) => state.theme.sidebarOpen);

  const handleCloseMobileSidebar = () => {
    dispatch(setMobileSidebarOpen(false));
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Drawer
          open={mobileSidebarOpen}
          onClose={handleCloseMobileSidebar}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
            },
          }}
        >
          <Sidebar />
        </Drawer>
      )}

      <Header />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH}px)`,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
