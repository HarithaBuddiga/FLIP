import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar, Box, Button, Card, CardContent, Chip, Grid,
  LinearProgress, Skeleton, Stack, Typography,
} from '@mui/material';
import {
  AutoStories, Bolt, EmojiEvents, LocalFireDepartment,
  PlayArrow, Quiz, Star,
} from '@mui/icons-material';
import { reviewAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const StatPill = ({ icon, label, value, loading, color = 'primary.main' }) => (
  <Card>
    <CardContent sx={{ p: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ width: 42, height: 42, borderRadius: 3, display: 'grid', placeItems: 'center', color: 'white', background: `linear-gradient(135deg, ${color}, #14B8A6)` }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          {loading ? <Skeleton width={48} /> : <Typography variant="h5">{value}</Typography>}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewAPI.getStats()
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const progressStats = stats?.progress || {};
  const xp = progressStats.xp ?? 0;
  const level = progressStats.level ?? 1;
  const streak = progressStats.streak ?? 0;
  const cardsReviewed = progressStats.cardsReviewed ?? 0;
  const goalProgress = Math.min(100, Math.round((Math.min(cardsReviewed, 20) / 20) * 100));

  return (
    <Box sx={{ py: 3, px: { xs: 2, md: 4 }, maxWidth: 1180, mx: 'auto' }}>
      <Card sx={{ mb: 3, color: 'white', background: 'linear-gradient(135deg, #061D42 0%, #0A2F6B 58%, #14B8A6 100%)' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 62, height: 62, bgcolor: 'rgba(255,255,255,0.22)', fontSize: 28, fontWeight: 900 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4">Hey, {user?.name?.split(' ')[0] || 'Learner'}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                  Ready to learn something new today?
                </Typography>
              </Box>
            </Stack>
            <Chip icon={<Star />} label={`Level ${level} Word Voyager`} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.18)' }} />
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatPill icon={<LocalFireDepartment />} label="Day streak" value={streak} loading={loading} color="#F97316" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatPill icon={<Bolt />} label="Total XP" value={xp} loading={loading} color="#F59E0B" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatPill icon={<AutoStories />} label="Cards learned" value={cardsReviewed} loading={loading} color="#14B8A6" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h5">Continue Learning</Typography>
                  <Typography variant="body2" color="text.secondary">Pick up your next flashcard or quiz session.</Typography>
                </Box>
                <Button endIcon={<PlayArrow />} onClick={() => navigate('/study-hub')}>See all</Button>
              </Stack>

              {loading ? (
                <Skeleton variant="rounded" height={150} />
              ) : stats?.recentDecks?.length > 0 ? (
                <Stack spacing={1.5}>
                  {stats.recentDecks.map((deck) => (
                    <Card key={deck._id} sx={{ boxShadow: 'none', bgcolor: 'rgba(243,240,255,0.58)' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent="space-between">
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ width: 58, height: 58, borderRadius: 4, display: 'grid', placeItems: 'center', color: 'white', background: 'linear-gradient(135deg, #0A2F6B, #14B8A6)' }}>
                              <AutoStories />
                            </Box>
                            <Box>
                              <Typography variant="h6">{deck.title}</Typography>
                              <Typography variant="caption" color="text.secondary">{deck.category || 'General'} world</Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={1}>
                            <Button variant="contained" size="small" onClick={() => navigate(`/study/${deck._id}`)}>Flashcards</Button>
                            <Button variant="outlined" size="small" startIcon={<Quiz />} onClick={() => navigate(`/quiz/${deck._id}`)}>Quiz</Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>No learning activity yet</Typography>
                  <Button variant="contained" onClick={() => navigate('/study-hub')}>Explore worlds</Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="h6">Daily Goal</Typography>
                  <EmojiEvents sx={{ color: 'warning.main' }} />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Learn 20 cards today.
                </Typography>
                <LinearProgress variant="determinate" value={goalProgress} sx={{ height: 10, borderRadius: 999, mb: 1 }} />
                <Typography variant="caption" color="text.secondary">{Math.min(cardsReviewed, 20)} / 20 cards</Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" gutterBottom>Today&apos;s Review</Typography>
                <Typography variant="h3" color="primary.main">{stats?.cardsDueToday ?? 0}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>cards are ready for recall practice</Typography>
                <Button fullWidth variant="contained" onClick={() => navigate('/study-hub')}>Start review</Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
