import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, CircularProgress, Container, Stack,
  IconButton, InputAdornment, TextField, Typography,
} from '@mui/material';
import { Google, Apple, Email, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from '../components/BrandLogo';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSocialSignup = (provider) => {
    setError(`${provider} signup is not configured yet. Please create your account with email and password.`);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 3, px: 2 }}>
      <Container maxWidth="xs" disableGutters>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.94)', borderRadius: 7, p: 3, boxShadow: 4, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <BrandLogo size={90} stacked maxWidth={260} />
            </Box>
            <Typography variant="h3">Welcome to FLIP</Typography>
            <Typography variant="body2" color="text.secondary">
              Create your account and start your immersion journey.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={1.5}>
              <TextField label="Full name" name="name" value={form.name} onChange={handleChange} fullWidth autoFocus />
              <TextField label="Email address" name="email" type="email" value={form.email} onChange={handleChange} fullWidth />
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                fullWidth
                helperText="At least 6 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        edge="end"
                        onClick={() => setShowPassword((value) => !value)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} startIcon={!loading ? <Email /> : null}>
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Account'}
              </Button>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.25} sx={{ mt: 2 }}>
            <Button variant="outlined" fullWidth sx={{ minWidth: 0, color: 'text.primary' }} onClick={() => handleSocialSignup('Apple')}><Apple /></Button>
            <Button variant="outlined" fullWidth sx={{ minWidth: 0, color: 'text.primary' }} onClick={() => handleSocialSignup('Google')}><Google /></Button>
            <Button variant="outlined" fullWidth sx={{ minWidth: 0, color: 'text.primary' }} onClick={() => handleSocialSignup('Email shortcut')}><Email /></Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5, textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0A2F6B', fontWeight: 900, textDecoration: 'none' }}>
              Log in
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPage;
