import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  MyLocation as TargetIcon,
  Visibility as VisibilityIcon,
  EmojiEvents as ValueIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const values = [
    { icon: <TargetIcon sx={{ fontSize: 40 }} />, title: 'Our Mission', description: 'Empower businesses with enterprise-grade analytics.' },
    { icon: <VisibilityIcon sx={{ fontSize: 40 }} />, title: 'Our Vision', description: 'Data-driven decisions accessible to every business.' },
    { icon: <ValueIcon sx={{ fontSize: 40 }} />, title: 'Our Values', description: 'Integrity, innovation, and customer success.' },
  ];

  const stats = [
    { value: '10K+', label: 'Customers' },
    { value: '500M+', label: 'Data Points/Day' },
    { value: '99.9%', label: 'Uptime' },
    { value: '150+', label: 'Team Members' },
  ];

  const team = [
    { name: 'John Smith', role: 'CEO & Co-Founder', avatar: 'JS' },
    { name: 'Sarah Johnson', role: 'CTO & Co-Founder', avatar: 'SJ' },
    { name: 'Michael Chen', role: 'CPO', avatar: 'MC' },
    { name: 'Emily Rodriguez', role: 'VP Engineering', avatar: 'ER' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 'bold' }}>
        Enterprise SaaS
      </Typography>
      <List>
        <ListItem button component="a" href="/">
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component="a" href="/features">
          <ListItemText primary="Features" />
        </ListItem>
        <ListItem button component="a" href="/about">
          <ListItemText primary="About" />
        </ListItem>
        <ListItem button component="a" href="/contact">
          <ListItemText primary="Contact" />
        </ListItem>
        <ListItem button component="a" href="/login">
          <ListItemText primary="Login" />
        </ListItem>
        <ListItem>
          <Button variant="contained" fullWidth component="a" href="/register">
            Get Started
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Navigation */}
      <AppBar position="fixed" color="transparent" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <DashboardIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 'bold', ml: 1 }}>
              Enterprise SaaS
            </Typography>

            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Button color="inherit" component="a" href="/">Home</Button>
                <Button color="inherit" component="a" href="/features">Features</Button>
                <Button color="inherit" component="a" href="/pricing">Pricing</Button>
                <Button color="inherit" component="a" href="/about">About</Button>
                <Button color="inherit" component="a" href="/contact">Contact</Button>
                <Button color="inherit" component="a" href="/login">Login</Button>
                <Button variant="contained" component="a" href="/register">Get Started</Button>
              </Box>
            )}

            <IconButton color="inherit" sx={{ display: { md: 'none' } }} onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: 240 } }}>
        {drawer}
      </Drawer>

      {/* Hero Section - Full Viewport */}
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        bgcolor: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        color: 'white',
        pt: 8 
      }}>
        <Container maxWidth="lg">
          <Typography variant={isMobile ? 'h3' : 'h2'} fontWeight="bold" gutterBottom align="center">
            About Our Company
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }} align="center" maxWidth="700px" mx="auto">
            We're on a mission to make enterprise-grade analytics accessible to businesses of all sizes
          </Typography>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 4, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Story Section - Full Viewport */}
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        alignItems: 'center',
        py: 8,
        bgcolor: 'background.default' 
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box component="img" src="https://via.placeholder.com/500x400/1976d2/ffffff?text=Our+Story" alt="Our Story" sx={{ width: '100%', borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Our Story
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Founded in 2020, Enterprise SaaS Dashboard was born from a simple observation: powerful analytics tools were only available to large enterprises.
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Today, we serve over 10,000 customers worldwide, from startups to established enterprises.
              </Typography>
              <Button variant="contained" size="large" component="a" href="/register">Join Us Today</Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Values Section - Full Viewport */}
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        alignItems: 'center',
        py: 8,
        bgcolor: 'background.paper' 
      }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="bold" gutterBottom align="center" mb={6}>
            Our Values
          </Typography>
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 4 }}>
                  <CardContent>
                    <Box sx={{ color: 'primary.main', mb: 2, display: 'flex', justifyContent: 'center' }}>
                      {value.icon}
                    </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {value.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team Section - Full Viewport */}
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        alignItems: 'center',
        py: 8,
        bgcolor: 'background.default' 
      }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="bold" gutterBottom align="center" mb={2}>
            Meet Our Leadership
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" mb={6}>
            Industry veterans passionate about democratizing analytics
          </Typography>
          <Grid container spacing={4}>
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ textAlign: 'center' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Avatar sx={{ width: 80, height: 80, fontSize: 32, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                      {member.avatar}
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">{member.name}</Typography>
                    <Typography variant="body2" color="primary.main">{member.role}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 6, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg" textAlign="center">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Join Our Growing Community
          </Typography>
          <Button variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.main', mt: 2 }} component="a" href="/register">
            Get Started Free
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, bgcolor: 'secondary.900', color: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <DashboardIcon />
            <Typography variant="h6" fontWeight="bold">Enterprise SaaS</Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © 2024 Enterprise SaaS Dashboard. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default About;
