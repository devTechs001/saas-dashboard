import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Alert, Stack, Link, Divider, Chip,
  InputAdornment, IconButton, MenuItem,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import BusinessIcon from '@mui/icons-material/BusinessOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice.jsx';
import { authService } from '../services';
import { startDemoSession } from '../utils/demoAuth';
import AuthLayout from '../components/auth/AuthLayout';

const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–1000', '1000+'];

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { name: '', email: '', company: '', companySize: COMPANY_SIZES[0], password: '' },
    validationSchema: Yup.object({
      name: Yup.string().min(2, 'Too short').required('Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      company: Yup.string().required('Company is required'),
      companySize: Yup.string().required('Select a size'),
      password: Yup.string().min(8, 'At least 8 characters').required('Password is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        dispatch(loginStart());
        setError('');
        const response = await authService.register(values);
        dispatch(loginSuccess(response.data));
        navigate('/onboarding');
      } catch (err) {
        if (!err.response) {
          const session = startDemoSession('admin');
          dispatch(loginSuccess(session));
          navigate('/onboarding');
          return;
        }
        dispatch(loginFailure(err.response?.data?.message || 'Registration failed'));
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Start your free 14-day trial — full access, no credit card required."
      footer={
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" fontWeight={700} underline="hover">
            Sign in
          </Link>
        </Typography>
      }
    >
      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5 }}>{error}</Alert>}

      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth id="name" name="name" label="Full name" placeholder="Ada Lovelace"
              value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" color="action" /></InputAdornment> }}
            />
            <TextField
              fullWidth id="email" name="email" label="Work email" placeholder="you@company.com"
              value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" color="action" /></InputAdornment> }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth id="company" name="company" label="Company" placeholder="Acme Inc."
              value={formik.values.company} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.company && Boolean(formik.errors.company)}
              helperText={formik.touched.company && formik.errors.company}
              InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon fontSize="small" color="action" /></InputAdornment> }}
            />
            <TextField
              select fullWidth id="companySize" name="companySize" label="Company size" value={formik.values.companySize}
              onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.companySize && Boolean(formik.errors.companySize)}
              helperText={formik.touched.companySize && formik.errors.companySize}
              sx={{ minWidth: 170 }}
            >
              {COMPANY_SIZES.map((s) => <MenuItem key={s} value={s}>{s} employees</MenuItem>)}
            </TextField>
          </Stack>

          <TextField
            fullWidth id="password" name="password" label="Password" type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 characters"
            value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" color="action" /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {['14-day free trial', 'No credit card', 'Cancel anytime'].map((t) => (
              <Chip key={t} size="small" icon={<CheckIcon sx={{ fontSize: '14px !important', color: 'success.main !important' }} />} label={t} variant="outlined" />
            ))}
          </Stack>

          <Button
            type="submit" fullWidth variant="contained" size="large"
            disabled={formik.isSubmitting} sx={{ py: 1.4, fontSize: '1rem', borderRadius: 2.5 }}
          >
            {formik.isSubmitting ? 'Creating workspace…' : 'Create workspace'}
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            By creating an account you agree to our{' '}
            <Link href="#" underline="hover">Terms of Service</Link> and{' '}
            <Link href="#" underline="hover">Privacy Policy</Link>.
          </Typography>
        </Stack>
      </form>

      <Divider sx={{ my: 3 }}>
        <Chip label="just looking around?" size="small" sx={{ fontWeight: 600 }} />
      </Divider>

      <Button
        fullWidth variant="outlined" size="large" startIcon={<AutoAwesomeIcon />}
        onClick={() => { const s = startDemoSession('admin'); dispatch(loginSuccess(s)); navigate('/dashboard'); }}
        sx={{ borderRadius: 2.5 }}
      >
        Explore the live demo
      </Button>
    </AuthLayout>
  );
};

export default Register;
