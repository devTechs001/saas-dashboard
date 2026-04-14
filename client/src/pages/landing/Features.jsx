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
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Features = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const categories = [
    {
      title: 'Analytics & Reporting',
      icon: <AnalyticsIcon />,
      items: ['Real-time Dashboards', 'Custom Reports', 'Data Visualization', 'Trend Analysis'],
    },
    {
      title: 'Customer Management',
      icon: <PeopleIcon />,
      items: ['CRM Integration', 'Segmentation', 'Lead Tracking', 'Customer Health'],
    },
    {
      title: 'Business Intelligence',
      icon: <TrendingUpIcon />,
      items: ['KPI Tracking', 'Forecasting', 'Cohort Analysis', 'Revenue Analytics'],
    },
    {
      title: 'Security & Access',
      icon: <SecurityIcon />,
      items: ['Role-Based Access', 'Multi-Tenancy', 'Audit Logs', 'SSO Integration'],
    },
  ];

  const faqs = [
    { q: 'How easy is it to get started?', a: 'Getting started is simple! Sign up for a free trial and set up your dashboard in minutes.' },
    { q: 'Can I integrate with my existing tools?', a: 'Yes! We offer 50+ pre-built integrations and a REST API for custom connections.' },
    { q: 'Is my data secure?', a: 'Absolutely. We use bank-level encryption and are SOC 2 compliant.' },
    { q: 'Do you offer a free trial?', a: 'Yes, we offer a 14-day free trial on all plans. No credit card required.' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
        bgcolor: 'primary.main', 
        color: 'white',
        pt: 8 
      }}>
        <Container maxWidth="lg">
          <Typography variant={isMobile ? 'h3' : 'h2'} fontWeight="bold" gutterBottom align="center">
            Features That Drive Results
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }} align="center" maxWidth="600px" mx="auto">
            Everything you need to analyze, manage, and grow your business
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.main' }} component="a" href="/register">
              Start Free Trial <ArrowForwardIcon sx={{ ml: 1 }} />
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Categories - Full Viewport */}
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        alignItems: 'center',
        py: 8,
        bgcolor: 'background.default' 
      }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="bold" gutterBottom align="center" mb={6}>
            Feature Categories
          </Typography>
          <Grid container spacing={3}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>{category.icon}</Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {category.title}
                    </Typography>
                    {category.items.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">{item}</Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section - Full Viewport */}
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        alignItems: 'center',
        py: 8,
        bgcolor: 'background.paper' 
      }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="bold" gutterBottom align="center" mb={2}>
            Frequently Asked Questions
          </Typography>
          <Typography variant="h6" color="text.secondary" align="center" mb={6}>
            Got questions? We have answers.
          </Typography>
          <Grid container spacing={2}>
            {faqs.map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="bold">{faq.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">{faq.a}</Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 6, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg" textAlign="center">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Ready to See All Features?
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

export default Features;
