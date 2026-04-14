import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const steps = ['Welcome', 'Company Info', 'Select Features', 'Configure Dashboard', 'Complete'];

const Onboarding = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    features: [],
    dashboardLayout: 'default',
    receiveTips: true,
    newsletter: false,
  });

  const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Retail',
    'Manufacturing',
    'Education',
    'Media',
    'Other',
  ];

  const companySizes = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+',
  ];

  const availableFeatures = [
    { id: 'analytics', name: 'Analytics Dashboard', icon: <AnalyticsIcon />, description: 'Track key metrics and KPIs' },
    { id: 'customers', name: 'Customer Management', icon: <PeopleIcon />, description: 'Manage customer relationships' },
    { id: 'reports', name: 'Custom Reports', icon: <DashboardIcon />, description: 'Build and share reports' },
    { id: 'settings', name: 'Team Settings', icon: <SettingsIcon />, description: 'Manage team access' },
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      navigate('/dashboard');
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFeatureToggle = (featureId) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter((f) => f !== featureId)
        : [...prev.features, featureId],
    }));
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box textAlign="center" py={4}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: 24,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <DashboardIcon sx={{ fontSize: 64 }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome to Enterprise SaaS!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph maxWidth="500px" mx="auto">
              Let's set up your dashboard in a few simple steps. This will help us customize the experience for your needs.
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              {[
                { icon: <AnalyticsIcon />, text: 'Analytics' },
                { icon: <PeopleIcon />, text: 'CRM' },
                { icon: <DashboardIcon />, text: 'Reports' },
              ].map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  {item.icon}
                  <Typography variant="body2">{item.text}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box py={4}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Tell us about your company
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              This helps us tailor the dashboard to your industry.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Enter your company name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    value={formData.industry}
                    label="Industry"
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  >
                    {industries.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Company Size</InputLabel>
                  <Select
                    value={formData.companySize}
                    label="Company Size"
                    onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  >
                    {companySizes.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size} employees
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.receiveTips}
                      onChange={(e) => setFormData({ ...formData, receiveTips: e.target.checked })}
                    />
                  }
                  label="Send me product tips and best practices"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.newsletter}
                      onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                    />
                  }
                  label="Subscribe to our newsletter"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box py={4}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Select features to enable
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Choose the modules you want in your dashboard. You can change this later.
            </Typography>
            <Grid container spacing={3}>
              {availableFeatures.map((feature) => (
                <Grid item xs={12} sm={6} key={feature.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: formData.features.includes(feature.id) ? '2px solid' : '1px solid',
                      borderColor: formData.features.includes(feature.id) ? 'primary.main' : 'divider',
                      '&:hover': { boxShadow: 3 },
                      transition: 'all 0.3s',
                    }}
                    onClick={() => handleFeatureToggle(feature.id)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            color: formData.features.includes(feature.id) ? 'primary.main' : 'text.secondary',
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {feature.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {feature.description}
                          </Typography>
                        </Box>
                        <Checkbox checked={formData.features.includes(feature.id)} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box py={4}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Choose your dashboard layout
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Select a starting layout for your dashboard.
            </Typography>
            <Grid container spacing={3}>
              {[
                { id: 'default', name: 'Default', description: 'Balanced layout with all widgets' },
                { id: 'analytics', name: 'Analytics Focus', description: 'Emphasis on charts and metrics' },
                { id: 'minimal', name: 'Minimal', description: 'Clean and simple layout' },
              ].map((layout) => (
                <Grid item xs={12} key={layout.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: formData.dashboardLayout === layout.id ? '2px solid' : '1px solid',
                      borderColor: formData.dashboardLayout === layout.id ? 'primary.main' : 'divider',
                      '&:hover': { boxShadow: 3 },
                      transition: 'all 0.3s',
                    }}
                    onClick={() => setFormData({ ...formData, dashboardLayout: layout.id })}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 2,
                            bgcolor: formData.dashboardLayout === layout.id ? 'primary.light' : 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <DashboardIcon
                            sx={{
                              color: formData.dashboardLayout === layout.id ? 'primary.main' : 'text.secondary',
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {layout.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {layout.description}
                          </Typography>
                        </Box>
                        <Chip
                          icon={formData.dashboardLayout === layout.id ? <CheckIcon /> : null}
                          label={formData.dashboardLayout === layout.id ? 'Selected' : ''}
                          color={formData.dashboardLayout === layout.id ? 'primary' : 'default'}
                          variant={formData.dashboardLayout === layout.id ? 'filled' : 'outlined'}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box textAlign="center" py={4}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: 'success.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <CheckIcon sx={{ fontSize: 48 }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              You're all set!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph maxWidth="500px" mx="auto">
              Your dashboard has been configured based on your preferences. Let's get started!
            </Typography>
            <Paper sx={{ p: 3, mt: 4, bgcolor: 'background.default' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Your Setup Summary
              </Typography>
              <Box sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>Company:</strong> {formData.companyName || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>Industry:</strong> {formData.industry || 'Not specified'}
                </Typography>
                <Typography variant="body2">
                  <strong>Features:</strong> {formData.features.length > 0 ? formData.features.join(', ') : 'Default'}
                </Typography>
                <Typography variant="body2">
                  <strong>Layout:</strong> {formData.dashboardLayout}
                </Typography>
              </Box>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          {/* Progress Stepper */}
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontWeight: index === activeStep ? 'bold' : 'normal',
                      color: index <= activeStep ? 'primary.main' : 'text.secondary',
                    },
                  }}
                >
                  {label}
                </StepLabel>
                <StepContent>
                  {renderStepContent(index)}
                </StepContent>
              </Step>
            ))}
          </Stepper>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={activeStep === steps.length - 1 ? <CheckIcon /> : <ArrowForwardIcon />}
              disabled={
                (activeStep === 1 && !formData.companyName) ||
                (activeStep === 2 && formData.features.length === 0)
              }
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Continue'}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Onboarding;
