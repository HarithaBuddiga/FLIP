import React, { useEffect, useState } from 'react';
import {
  Avatar, Box, Button, Card, CardContent, Divider, Grid,
  LinearProgress, Stack, Typography,
} from '@mui/material';
import {
  AutoStories, EmojiEvents, LocalFireDepartment, Logout,
  MilitaryTech, Shield, Star, WorkspacePremium,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { progressAPI } from '../services/api';

const Badge = ({ icon, label, color }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Box sx={{ width: 58, height: 58, mx: 'auto', mb: 0.75, borderRadius: 4, display: 'grid', placeItems: 'center', color: 'white', background: `linear-gradient(135deg, ${color}, #0A2F6B)`, boxShadow: '0 14px 28px rgb(10 47 107 / 0.18)' }}>
      {icon}
    </Box>
    <Typography variant="caption" fontWeight={900}>{label}</Typography>
  </Box>
);

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileStats, setProfileStats] = useState(null);
  const progress = profileStats?.progress || {};
  const totals = profileStats?.totals || {};
  const xp = progress.xp || 0;
  const level = progress.level || 1;
  const streak = progress.streak || 0;

  useEffect(() => {
    progressAPI.getMe()
      .then(({ data }) => setProfileStats(data.data))
      .catch(() => setProfileStats(null));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Box sx={{ py: 3, px: { xs: 2, md: 4 }, maxWidth: 920, mx: 'auto' }}>
      <Card sx={{ mb: 2, color: 'white', background: 'linear-gradient(135deg, #061D42, #0A2F6B, #14B8A6)' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
          <Avatar sx={{ width: 92, height: 92, mx: 'auto', mb: 2, bgcolor: 'rgba(255,255,255,0.22)', fontSize: 38, fontWeight: 900 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h3">{user?.name}</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)', mb: 2 }}>{user?.email}</Typography>
          <Typography variant="body2" fontWeight={900}>Word Voyager - Level {level}</Typography>
          <LinearProgress variant="determinate" value={76} sx={{ maxWidth: 360, mx: 'auto', mt: 1.5, height: 9, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.22)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }} />
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={4}>
          <Card><CardContent sx={{ textAlign: 'center', p: 2 }}><Star color="warning" /><Typography variant="h5">{xp}</Typography><Typography variant="caption">Total XP</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={4}>
          <Card><CardContent sx={{ textAlign: 'center', p: 2 }}><LocalFireDepartment color="error" /><Typography variant="h5">{streak}</Typography><Typography variant="caption">Day Streak</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={4}>
          <Card><CardContent sx={{ textAlign: 'center', p: 2 }}><AutoStories color="primary" /><Typography variant="h5">{totals.worlds || 0}</Typography><Typography variant="caption">Worlds</Typography></CardContent></Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5">Achievements</Typography>
            <Typography variant="caption" color="primary.main" fontWeight={900}>See all</Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={3}><Badge icon={<MilitaryTech />} label="Word Master" color="#0A2F6B" /></Grid>
            <Grid item xs={3}><Badge icon={<LocalFireDepartment />} label="Streak" color="#F59E0B" /></Grid>
            <Grid item xs={3}><Badge icon={<Shield />} label="Recall" color="#14B8A6" /></Grid>
            <Grid item xs={3}><Badge icon={<EmojiEvents />} label="Perfect" color="#F59E0B" /></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h5" gutterBottom>Learning Statistics</Typography>
          <Stack spacing={1.5}>
            {[
              ['Cards Learned', progress.cardsReviewed || 0, <AutoStories />],
              ['Quizzes Completed', progress.quizzesCompleted || 0, <WorkspacePremium />],
              ['Accuracy', `${progress.accuracy || 0}%`, <Shield />],
              ['Worlds Created', totals.worlds || 0, <Star />],
            ].map(([label, value, icon]) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 4, bgcolor: 'rgba(232,247,245,0.72)' }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box sx={{ color: 'primary.main' }}>{icon}</Box>
                  <Typography variant="body2" fontWeight={900}>{label}</Typography>
                </Stack>
                <Typography variant="body2" fontWeight={900}>{value}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderColor: showLogoutConfirm ? 'error.light' : 'divider' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6">Sign out</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>You will need to log in again to continue learning.</Typography>
          <Divider sx={{ mb: 2 }} />
          {showLogoutConfirm ? (
            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="error" startIcon={<Logout />} onClick={handleLogout}>Yes, sign out</Button>
              <Button variant="outlined" onClick={() => setShowLogoutConfirm(false)}>Cancel</Button>
            </Stack>
          ) : (
            <Button variant="outlined" color="error" startIcon={<Logout />} onClick={() => setShowLogoutConfirm(true)}>Sign out</Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
