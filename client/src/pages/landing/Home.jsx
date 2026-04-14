import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
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
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const LandingHome = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const features = [
    {
      icon: <DashboardIcon sx={{ fontSize: 32 }} />,
      title: 'Powerful Dashboard',
      description: 'Real-time analytics with customizable widgets.',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 32 }} />,
      title: 'Advanced Analytics',
      description: 'Deep dive into your data with reports.',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 32 }} />,
      title: 'Customer Management',
      description: 'Complete CRM functionality.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 32 }} />,
      title: 'Enterprise Security',
      description: 'Role-based access control.',
    },
    {
      icon: <CloudIcon sx={{ fontSize: 32 }} />,
      title: 'Cloud Native',
      description: '99.9% uptime guarantee.',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      title: 'Business Growth',
      description: 'Data-driven decisions.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '50M+', label: 'Data Points' },
    { value: '24/7', label: 'Support' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navLinks = [
    { name: 'Features', href: '/features' },
    { name: 'About', href: '/about' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '/contact' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 'bold' }}>
        Enterprise SaaS
      </Typography>
      <List>
        {navLinks.map((item) => (
          <ListItem button key={item.name} component="a" href={item.href}>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
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
                {navLinks.map((link) => (
                  <Typography
                    key={link.name}
                    component="a"
                    href={link.href}
                    sx={{
                      color: 'text.primary',
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {link.name}
                  </Typography>
                ))}
                <Button color="inherit" component="a" href="/login">
                  Login
                </Button>
                <Button variant="contained" component="a" href="/register">
                  Get Started
                </Button>
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

      {/* Hero Section - Full Viewport Height */}
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        bgcolor: 'primary.main', 
        color: 'white',
        pt: 8 
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="NEW v2.0" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              <Typography variant={isMobile ? 'h3' : 'h2'} fontWeight="bold" gutterBottom>
                Transform Your Business with Data
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                The all-in-one platform for analytics, customer management, and business intelligence.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }} component="a" href="/register">
                  Start Free Trial
                </Button>
                <Button variant="outlined" size="large" sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }} component="a" href="/features">
                  Learn More
                </Button>
              </Box>
              <Box sx={{ mt: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <CheckCircleIcon key={star} sx={{ fontSize: 16 }} />
                ))}
                <Typography sx={{ ml: 1, fontSize: 14 }}>Trusted by 10,000+ businesses</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box component="img" src="https://via.placeholder.com/600x400/ffffff/1976d2?text=Dashboard+Preview" alt="Dashboard Preview" sx={{ width: '100%', borderRadius: 2, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }} />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section - Compact */}
      <Box sx={{ py: 4, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
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

      {/* Features Section - Full Viewport Height */}
      <Box id="features" sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
        py: 8 
      }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Powerful Features
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Everything you need to grow your business
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section - Full Viewport Height */}
      <Box id="pricing" sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.paper',
        py: 8 
      }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Simple Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Choose the plan that fits your needs
            </Typography>
          </Box>
          <Grid container spacing={4} justifyContent="center">
            {[
              { name: 'Starter', price: '$29', desc: 'For small teams', features: ['5 users', 'Basic analytics', '5GB storage'] },
              { name: 'Professional', price: '$99', desc: 'For growing businesses', features: ['25 users', 'Advanced analytics', '50GB storage', 'API access'], highlighted: true },
              { name: 'Enterprise', price: '$299', desc: 'For large organizations', features: ['Unlimited users', 'Full suite', 'Unlimited storage', '24/7 support'] },
            ].map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ 
                  height: '100%', 
                  position: 'relative',
                  border: plan.highlighted ? '2px solid' : '1px solid',
                  borderColor: plan.highlighted ? 'primary.main' : 'divider'
                }}>
                  {plan.highlighted && <Chip label="POPULAR" color="primary" sx={{ position: 'absolute', top: 12, right: 12, size: 'small' }} />}
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>{plan.name}</Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">{plan.price}<Typography component="span" variant="body2" color="text.secondary">/mo</Typography></Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>{plan.desc}</Typography>
                    <Button variant={plan.highlighted ? 'contained' : 'outlined'} fullWidth sx={{ mb: 3 }}>Get Started</Button>
                    {plan.features.map((feat, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mr: 1 }} />
                        <Typography variant="body2">{feat}</Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg" textAlign="center">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of businesses transforming their operations
          </Typography>
          <Button variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.main' }} component="a" href="/register">
            Start Free Trial
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

export default LandingHome;
