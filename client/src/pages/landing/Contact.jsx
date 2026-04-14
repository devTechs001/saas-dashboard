import React, { useState } from 'react';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

const Contact = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactInfo = [
    { icon: <EmailIcon />, title: 'Email', content: 'support@enterprisesaas.com' },
    { icon: <PhoneIcon />, title: 'Phone', content: '+1 (555) 123-4567' },
    { icon: <LocationOnIcon />, title: 'Address', content: 'San Francisco, CA' },
  ];

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    subject: Yup.string().required('Subject is required'),
    message: Yup.string().min(10, 'Message must be at least 10 characters').required('Message is required'),
  });

  const formik = useFormik({
    initialValues: { name: '', email: '', subject: '', message: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Form submitted:', values);
        setSubmitted(true);
        toast.success('Message sent successfully!');
        resetForm();
        setTimeout(() => setSubmitted(false), 5000);
      } catch (error) {
        toast.error('Failed to send message.');
      } finally {
        setSubmitting(false);
      }
    },
  });

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
            Get in Touch
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }} align="center" maxWidth="600px" mx="auto">
            Have questions? We're here to help.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {contactInfo.map((info, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(255,255,255,0.1)', px: 2, py: 1, borderRadius: 1 }}>
                {info.icon}
                <Typography variant="body2">{info.content}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Contact Form Section - Full Viewport */}
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        alignItems: 'center',
        py: 8,
        bgcolor: 'background.default' 
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Send us a Message
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Fill out the form below and we'll get back to you.
                  </Typography>

                  {submitted && (
                    <Box sx={{ p: 2, mb: 3, bgcolor: 'success.light', color: 'success.dark', borderRadius: 1 }}>
                      <Typography variant="body2">Thank you! Your message has been sent.</Typography>
                    </Box>
                  )}

                  <Box component="form" onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Full Name *"
                          name="name"
                          value={formik.values.name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.name && Boolean(formik.errors.name)}
                          helperText={formik.touched.name && formik.errors.name}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email Address *"
                          name="email"
                          type="email"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.email && Boolean(formik.errors.email)}
                          helperText={formik.touched.email && formik.errors.email}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth error={formik.touched.subject && Boolean(formik.errors.subject)}>
                          <InputLabel>Subject *</InputLabel>
                          <Select
                            name="subject"
                            value={formik.values.subject}
                            label="Subject *"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          >
                            <MenuItem value="sales">Sales Inquiry</MenuItem>
                            <MenuItem value="support">Technical Support</MenuItem>
                            <MenuItem value="billing">Billing Question</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                          </Select>
                          {formik.touched.subject && formik.errors.subject && (
                            <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>{formik.errors.subject}</Typography>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Message *"
                          name="message"
                          multiline
                          rows={4}
                          value={formik.values.message}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.message && Boolean(formik.errors.message)}
                          helperText={formik.touched.message && formik.errors.message}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button type="submit" variant="contained" size="large" fullWidth disabled={formik.isSubmitting} startIcon={<SendIcon />}>
                          {formik.isSubmitting ? 'Sending...' : 'Send Message'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Card sx={{ mb: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Sales Inquiries
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Interested in our enterprise plans? Our sales team can help.
                    </Typography>
                    <Button variant="outlined" fullWidth component="a" href="mailto:sales@enterprisesaas.com">Contact Sales</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Technical Support
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Need help? Our support team is available 24/7 for enterprise customers.
                    </Typography>
                    <Button variant="outlined" fullWidth component="a" href="mailto:support@enterprisesaas.com">Get Support</Button>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 6, bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="lg" textAlign="center">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Button variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.main', mt: 2 }} component="a" href="/register">
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

export default Contact;
