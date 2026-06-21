import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, Button, Skeleton,
  Chip, TextField, InputAdornment, Alert, Avatar,
} from '@mui/material';
import { Search, PlayArrow, Public, Quiz, Add } from '@mui/icons-material';
import { deckAPI } from '../services/api';

const PublicDecksPage = () => {
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    deckAPI.getPublic()
      .then(({ data }) => setDecks(data.data.decks))
      .catch(() => setError('Failed to load public decks.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = decks.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    (d.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.createdBy?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleClone = async (deckId) => {
    try {
      const { data } = await deckAPI.clone(deckId);
      setMessage('World added to your decks.');
      navigate(`/decks/${data.data.deck._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add world to your decks.');
    }
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Public sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>Learning Worlds</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Choose a world, practice flashcards, and test yourself with quizzes.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}

      <TextField
        placeholder="Search worlds, topics, or creators..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ mb: 3, maxWidth: 400 }}
        fullWidth
        InputProps={{
          startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
        }}
      />

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="70%" height={28} />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="50%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filtered.length > 0 ? (
        <Grid container spacing={2}>
          {filtered.map((deck) => (
            <Grid item xs={12} sm={6} md={4} key={deck._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1, p: 2.5 }}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap gutterBottom>
                    {deck.title}
                  </Typography>
                  {deck.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {deck.description}
                    </Typography>
                  )}
                  <Chip label={deck.category || 'General'} size="small" sx={{ fontSize: '0.7rem', height: 22, mb: 1.5 }} />
                  
                  {deck.createdBy?.name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 20, height: 20, fontSize: '0.65rem', bgcolor: 'primary.main' }}>
                        {deck.createdBy.name.charAt(0)}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">{deck.createdBy.name}</Typography>
                    </Box>
                  )}
                </CardContent>
                <Box sx={{ px: 2.5, pb: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PlayArrow sx={{ fontSize: 16 }} />}
                    onClick={() => navigate(`/study/${deck._id}`)}
                    fullWidth
                    sx={{ fontSize: '0.8125rem', mb: 1 }}
                  >
                    Flashcards
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Quiz sx={{ fontSize: 16 }} />}
                    onClick={() => navigate(`/quiz/${deck._id}`)}
                    fullWidth
                    sx={{ fontSize: '0.8125rem', borderColor: 'divider', color: 'text.primary', mb: 1 }}
                  >
                    Quiz
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add sx={{ fontSize: 16 }} />}
                    onClick={() => handleClone(deck._id)}
                    fullWidth
                    sx={{ fontSize: '0.8125rem', borderColor: 'divider', color: 'text.primary' }}
                  >
                    Add to My Decks
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card sx={{ bgcolor: 'grey.50', border: '1px dashed', borderColor: 'divider' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {search ? 'No worlds match your search' : 'No learning worlds yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {search ? 'Try a different search term.' : 'Add starter content or publish a world for learners.'}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default PublicDecksPage;
