import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography, TextField, Button, Alert, Stack, Link, InputAdornment, IconButton,
} from '@mui/material';
import LockIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import KeyIcon from '@mui/icons-material/KeyOutlined';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AuthLayout from '../components/auth/AuthLayout';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const formik = useFormik({
    initialValues: { code: '', password: '', confirm: '' },
    validationSchema: Yup.object({
      code: Yup.string().min(6, 'Enter the 6-character code').required('Reset code is required'),
      password: Yup.string().min(8, 'At least 8 characters').required('Password is required'),
      confirm: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm your password'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      // Simulate the reset (core-api endpoint: POST /auth/reset-password)
      await new Promise((r) => setTimeout(r, 600));
      setDone(true);
      setSubmitting(false);
    },
  });

  return (
    <AuthLayout
      title={done ? 'Password updated' : 'Choose a new password'}
      subtitle={
        done
          ? 'Your password has been changed successfully. Sign in with your new credentials.'
          : 'Paste the code from your email and pick a strong new password.'
      }
      footer={
        <Typography variant="body2" color="text.secondary">
          Need a new link?{' '}
          <Link component={RouterLink} to="/forgot-password" fontWeight={700} underline="hover">Resend reset email</Link>
        </Typography>
      }
    >
      {done ? (
        <Stack spacing={2}>
          <Alert severity="success" sx={{ borderRadius: 2.5 }}>All set — you can now sign in.</Alert>
          <Button variant="contained" size="large" onClick={() => navigate('/login')} sx={{ py: 1.4, borderRadius: 2.5 }}>
            Continue to sign in
          </Button>
        </Stack>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2.25}>
            <TextField
              fullWidth id="code" name="code" label="Reset code" placeholder="e.g. 8F2A91"
              value={formik.values.code} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.code && Boolean(formik.errors.code)}
              helperText={formik.touched.code && formik.errors.code}
              InputProps={{ startAdornment: <InputAdornment position="start"><KeyIcon fontSize="small" color="action" /></InputAdornment> }}
            />
            <TextField
              fullWidth id="password" name="password" label="New password" type={showPassword ? 'text' : 'password'}
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
            <TextField
              fullWidth id="confirm" name="confirm" label="Confirm new password" type={showPassword ? 'text' : 'password'}
              value={formik.values.confirm} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.confirm && Boolean(formik.errors.confirm)}
              helperText={formik.touched.confirm && formik.errors.confirm}
              InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" color="action" /></InputAdornment> }}
            />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={formik.isSubmitting} sx={{ py: 1.4, borderRadius: 2.5 }}>
              {formik.isSubmitting ? 'Updating…' : 'Update password'}
            </Button>
          </Stack>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
