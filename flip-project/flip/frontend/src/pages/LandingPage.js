import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Stack, Grid, Card, CardContent } from '@mui/material';
import {
  FlipCameraAndroid as FlipIcon,
  Quiz as QuizIcon,
  TrendingUp as TrendIcon,
  School as SchoolIcon,
  ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from '../components/BrandLogo';

const Feature = ({ icon, title, desc }) => (
  <Box>
    <Box sx={{ mb: 1.5, color: 'primary.main' }}>{icon}</Box>
    <Typography variant="h6" fontWeight={600} gutterBottom>{title}</Typography>
    <Typography variant="body2" color="text.secondary" lineHeight={1.7}>{desc}</Typography>
  </Box>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box component="nav" sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(18px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 72, gap: 2 }}>
            <BrandLogo size={34} maxWidth={{ xs: 160, sm: 230 }} />
            {isAuthenticated ? (
              <Button variant="contained" onClick={() => navigate('/dashboard')} size="small">
                Open app
              </Button>
            ) : (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button variant="text" color="inherit" onClick={() => navigate('/login')} size="small">
                  Log in
                </Button>
                <Button variant="contained" onClick={() => navigate('/register')} size="small">
                  Get started
                </Button>
              </Stack>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 6, md: 8 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.95fr 1.05fr' }, gap: { xs: 4, md: 6 }, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
            <BrandLogo size={118} stacked maxWidth={{ xs: 300, sm: 380, md: 430 }} />
          </Box>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.1rem', md: '3.45rem' },
            fontWeight: 950,
            lineHeight: 1.05,
            mb: 2,
            color: 'primary.main',
          }}
        >
          Master Languages.
          <br />
          <Box component="span" sx={{ color: 'secondary.main' }}>
            One Flashcard At A Time.
          </Box>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto', lineHeight: 1.8, mb: 4 }}>
          FLIP combines learner-built decks, focused flashcard review, quizzes, and progress tracking into one calm immersion platform.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent={{ xs: 'center', md: 'flex-start' }}>
          <Button variant="contained" size="large" endIcon={<ArrowForward />} onClick={() => navigate('/register')} sx={{ px: 3.5 }}>
            Start learning
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate('/explore')} sx={{ px: 3.5, borderColor: 'divider', color: 'text.primary' }}>
            Explore worlds
          </Button>
        </Stack>
          </Box>
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 } }}>
        <Card sx={{ background: 'linear-gradient(135deg, rgba(10,47,107,0.96), rgba(20,184,166,0.90))', color: 'white' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px 1fr' }, gap: 3, alignItems: 'center' }}>
            <BrandLogo size={78} stacked maxWidth={220} />
            <Box>
              <Typography variant="h4" gutterBottom>Learning Taking Flight</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)', maxWidth: 720 }}>
                The origami bird represents knowledge becoming movement: small cards fold into habits, habits build progress, and progress helps learners grow with confidence.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>

      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Feature icon={<SchoolIcon sx={{ fontSize: 28 }} />} title="Immersive learning" desc="Focused study flows that keep the lesson front and center." />
            </Grid>
            <Grid item xs={12} md={3}>
              <Feature icon={<FlipIcon sx={{ fontSize: 28 }} />} title="Smart flashcards" desc="Flip cards smoothly and keep recall practice quick and clear." />
            </Grid>
            <Grid item xs={12} md={3}>
              <Feature icon={<QuizIcon sx={{ fontSize: 28 }} />} title="Quiz practice" desc="Reinforce what you know with quick checks and answer feedback." />
            </Grid>
            <Grid item xs={12} md={3}>
              <Feature icon={<TrendIcon sx={{ fontSize: 28 }} />} title="Track progress" desc="See progress, streaks, and due items without clutter." />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
