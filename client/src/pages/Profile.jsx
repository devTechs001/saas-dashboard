import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { PageBreadcrumb } from '../components/common';
import { authService } from '../services';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const permissions = user?.permissions || [];

  return (
    <Box>
      <PageBreadcrumb items={[{ label: 'Profile' }]} />

      <Typography variant="h4" fontWeight="bold" mb={3}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: 48,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <Typography variant="h5" fontWeight="bold">
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {user?.email}
              </Typography>
              <Chip
                label={user?.role}
                color="primary"
                sx={{ textTransform: 'capitalize' }}
              />
              <Button
                variant="outlined"
                color="error"
                fullWidth
                sx={{ mt: 3 }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Details Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Account Details
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user?.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user?.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Role
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" textTransform="capitalize">
                    {user?.role}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Account Status
                  </Typography>
                  <Chip label="Active" size="small" color="success" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Permissions
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {permissions.map((perm) => (
                      <Chip
                        key={perm}
                        label={perm}
                        size="small"
                        variant="outlined"
                        textTransform="capitalize"
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Login
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user?.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : 'First login'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/settings')}
                  >
                    Go to Settings
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/')}
                  >
                    View Dashboard
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="error"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
