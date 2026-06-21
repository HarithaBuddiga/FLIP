import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Grid, LinearProgress, Stack, Typography,
} from '@mui/material';
import {
  PlayArrow, Quiz, Public, Lock, TravelExplore,
} from '@mui/icons-material';
import { deckAPI } from '../services/api';

const uniqueDecks = (items) => {
  const seen = new Set();
  return items.filter((deck) => {
    if (seen.has(deck._id)) return false;
    seen.add(deck._id);
    return true;
  });
};

const progressForDeck = (deck) => Math.min(100, Math.max(12, (deck.cardCount || 0) * 10));

const StudyHubPage = () => {
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([deckAPI.getAll(), deckAPI.getPublic()])
      .then(([ownRes, publicRes]) => {
        setDecks(uniqueDecks([
          ...ownRes.data.data.decks,
          ...publicRes.data.data.decks,
        ]));
      })
      .catch(() => setError('Failed to load learning worlds.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <TravelExplore sx={{ color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={800}>Learning hub</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Choose a world, review flashcards, or jump into a quiz.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {decks.length === 0 ? (
        <Card sx={{ bgcolor: 'grey.50', border: '1px dashed', borderColor: 'divider' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>No learning worlds yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ask your mentor/admin to publish decks, or create starter content for the app.
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/decks/new')}>
              Add starter content
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {decks.map((deck) => {
            const progress = progressForDeck(deck);
            const canPractice = (deck.cardCount || 0) > 0;

            return (
              <Grid item xs={12} md={6} lg={4} key={deck._id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={800} gutterBottom>{deck.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 42 }}>
                          {deck.description || 'Practice vocabulary, recall answers, and build fluency.'}
                        </Typography>
                      </Box>
                      <Chip
                        icon={deck.isPublic ? <Public sx={{ fontSize: '14px !important' }} /> : <Lock sx={{ fontSize: '14px !important' }} />}
                        label={deck.isPublic ? 'World' : 'Private'}
                        size="small"
                        color={deck.isPublic ? 'secondary' : 'default'}
                        variant="outlined"
                      />
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip label={deck.category || 'General'} size="small" />
                      <Chip label={`${deck.cardCount || 0} cards`} size="small" variant="outlined" />
                    </Stack>

                    <Box sx={{ mb: 2.5 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                        <Typography variant="caption" color="text.secondary">World progress</Typography>
                        <Typography variant="caption" fontWeight={700}>{progress}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={progress} sx={{ height: 7, borderRadius: 999 }} />
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        disabled={!canPractice}
                        onClick={() => navigate(`/study/${deck._id}`)}
                        sx={{ flex: 1 }}
                      >
                        Flashcards
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Quiz />}
                        disabled={!canPractice}
                        onClick={() => navigate(`/quiz/${deck._id}`)}
                        sx={{ flex: 1, borderColor: 'divider', color: 'text.primary' }}
                      >
                        Quiz
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default StudyHubPage;
