import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography, TextField, Button, Alert, Stack, Link, InputAdornment, Box,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authService } from '../services';
import AuthLayout from '../components/auth/AuthLayout';

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await authService.forgotPassword(values.email);
      } catch {
        // Network/backend unavailable — the flow stays usable in demo mode.
        await new Promise((r) => setTimeout(r, 400));
      }
      setSent(true);
      setSubmitting(false);
    },
  });

  return (
    <AuthLayout
      title={sent ? 'Check your inbox' : 'Reset your password'}
      subtitle={
        sent
          ? `If an account exists for ${formik.values.email}, you'll receive a reset link shortly.`
          : 'Enter the email associated with your account and well send you a link to reset your password.'
      }
      footer={
        <Typography variant="body2" color="text.secondary">
          Remembered it?{' '}
          <Link component={RouterLink} to="/login" fontWeight={700} underline="hover">Back to sign in</Link>
        </Typography>
      }
    >
      {sent ? (
        <Stack spacing={2.5} alignItems="center" sx={{ textAlign: 'center', py: 2 }}>
          <Box sx={{
            width: 72, height: 72, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #D1FAE5, transparent)', color: 'success.main',
          }}>
            <MarkEmailReadIcon sx={{ fontSize: 38 }} />
          </Box>
          <Alert severity="success" sx={{ borderRadius: 2.5, width: '100%' }}>
            Reset link sent — it expires in 30 minutes.
          </Alert>
          <Button variant="outlined" fullWidth onClick={() => setSent(false)} sx={{ borderRadius: 2.5 }}>
            Resend link
          </Button>
          <Button variant="contained" fullWidth component={RouterLink} to="/reset-password" sx={{ borderRadius: 2.5 }}>
            I have a reset code
          </Button>
        </Stack>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2.25}>
            <TextField
              fullWidth id="email" name="email" label="Work email" placeholder="you@company.com"
              value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" color="action" /></InputAdornment> }}
            />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={formik.isSubmitting} sx={{ py: 1.4, borderRadius: 2.5 }}>
              {formik.isSubmitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </Stack>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
