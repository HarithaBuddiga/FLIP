import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, CircularProgress, Container, Divider,
  IconButton, InputAdornment, Stack, TextField, Typography,
} from '@mui/material';
import { Email, Google, Apple, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from '../components/BrandLogo';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSocialAuth = (provider) => {
    setError(`${provider} sign-in is not configured yet. Please continue with email and password.`);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 3, px: 2 }}>
      <Container maxWidth="xs" disableGutters>
        <Box
          sx={{
            minHeight: { xs: 'calc(100vh - 48px)', sm: 760 },
            borderRadius: 7,
            p: 3,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background:
              'linear-gradient(160deg, rgba(6,29,66,0.98) 0%, rgba(10,47,107,0.94) 56%, rgba(20,184,166,0.86) 100%)',
            boxShadow: '0 28px 80px rgb(10 47 107 / 0.26)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
            <BrandLogo size={108} stacked inverse maxWidth={300} />
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: 'rgba(255,255,255,0.96)', color: 'text.primary', borderRadius: 5, p: 2.25 }}>
            <Stack spacing={1.4}>
              <Button variant="outlined" startIcon={<Apple />} fullWidth sx={{ color: 'text.primary' }} onClick={() => handleSocialAuth('Apple')}>
                Continue with Apple
              </Button>
              <Button variant="outlined" startIcon={<Google />} fullWidth sx={{ color: 'text.primary' }} onClick={() => handleSocialAuth('Google')}>
                Continue with Google
              </Button>
              <Divider sx={{ py: 0.25 }}>
                <Typography variant="caption" color="text.secondary">or</Typography>
              </Divider>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField label="Email address" name="email" type="email" value={form.email} onChange={handleChange} fullWidth autoComplete="email" />
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                fullWidth
                autoComplete="current-password"
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
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Continue with Email'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.82)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: '#FFFFFF', fontWeight: 900 }}>
              Sign up
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
