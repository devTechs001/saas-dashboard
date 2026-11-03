import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, Stack, Link, Divider, Chip,
  InputAdornment, IconButton, FormControlLabel, Checkbox, MenuItem,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice.jsx';
import { authService } from '../services';
import { startDemoSession, DEMO_USERS } from '../utils/demoAuth';
import AuthLayout from '../components/auth/AuthLayout';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [demoRole, setDemoRole] = useState('admin');

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        dispatch(loginStart());
        setError('');
        const response = await authService.login(values);
        dispatch(loginSuccess(response.data));
        navigate('/dashboard');
      } catch (err) {
        // Demo fallback: when the core-api is unreachable, start a local session.
        if (!err.response) {
          const session = startDemoSession('admin');
          dispatch(loginSuccess(session));
          navigate('/dashboard');
          return;
        }
        dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleDemo = () => {
    const session = startDemoSession(demoRole);
    dispatch(loginSuccess(session));
    navigate('/dashboard');
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your workspace to pick up right where you left off."
      footer={
        <Typography variant="body2" color="text.secondary">
          New to Nexus?{' '}
          <Link component={RouterLink} to="/register" fontWeight={700} underline="hover">
            Create an account
          </Link>
        </Typography>
      }
    >
      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5 }}>{error}</Alert>}

      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={2.25}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Work email"
            placeholder="you@company.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><EmailIcon fontSize="small" color="action" /></InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><LockIcon fontSize="small" color="action" /></InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <FormControlLabel control={<Checkbox size="small" defaultChecked />} label={<Typography variant="body2">Remember me</Typography>} />
            <Link component={RouterLink} to="/forgot-password" variant="body2" fontWeight={600} underline="hover">
              Forgot password?
            </Link>
          </Stack>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={formik.isSubmitting}
            sx={{ py: 1.4, fontSize: '1rem', borderRadius: 2.5 }}
          >
            {formik.isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </Stack>
      </form>

      <Divider sx={{ my: 3 }}>
        <Chip label="or explore instantly" size="small" sx={{ fontWeight: 600 }} />
      </Divider>

      {/* Demo mode — showcase role-based access without a backend */}
      <Box sx={{ p: 2.25, borderRadius: 3, border: '1px dashed', borderColor: 'primary.main', bgcolor: 'action.hover' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <AutoAwesomeIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" fontWeight={700}>Demo mode</Typography>
          <Chip size="small" label="Test any role" color="primary" variant="outlined" sx={{ height: 20, fontSize: 10.5 }} />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}>
          <TextField
            select
            size="small"
            fullWidth
            label="View as"
            value={demoRole}
            onChange={(e) => setDemoRole(e.target.value)}
            sx={{ minWidth: 170 }}
          >
            {Object.entries(DEMO_USERS).map(([role, u]) => (
              <MenuItem key={role} value={role}>{u.name} — {role}</MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={handleDemo} sx={{ whiteSpace: 'nowrap', borderRadius: 2.5 }}>
            Explore demo
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
};

export default Login;
