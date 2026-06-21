import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, IconButton, InputAdornment,
  LinearProgress, Menu, MenuItem, Skeleton, Stack, TextField, Typography,
} from '@mui/material';
import {
  Add, AutoStories, Delete, Edit, MoreVert, PlayArrow,
  Public, Quiz, Search,
} from '@mui/icons-material';
import { deckAPI } from '../services/api';

const progressForDeck = (deck) => Math.min(100, Math.max(8, (deck.cardCount || 0) * 12));
const difficultyForDeck = (deck) => (deck.cardCount >= 15 ? 'Advanced' : deck.cardCount >= 7 ? 'Intermediate' : 'Beginner');

const DeckCard = ({ deck, onDelete }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const progress = progressForDeck(deck);

  return (
    <>
      <Card sx={{ height: '100%' }}>
        <Box sx={{ height: 112, p: 2, color: 'white', background: deck.isPublic ? 'linear-gradient(135deg, #0A2F6B, #14B8A6)' : 'linear-gradient(135deg, #061D42, #0A2F6B)' }}>
          <Stack direction="row" justifyContent="space-between">
            <Box sx={{ width: 58, height: 58, borderRadius: 4, display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.2)' }}>
              <AutoStories />
            </Box>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.14)' }}>
              <MoreVert />
            </IconButton>
          </Stack>
        </Box>
        <CardContent sx={{ p: 2.25 }}>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="h6" noWrap>{deck.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ minHeight: 42 }}>
                {deck.description || 'Practice vocabulary and recall through focused cards.'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={deck.category || 'General'} size="small" />
              <Chip icon={<Public sx={{ fontSize: '14px !important' }} />} label={deck.isPublic ? 'Shared' : 'Private'} size="small" variant="outlined" />
              <Chip label={difficultyForDeck(deck)} size="small" color="secondary" variant="outlined" />
            </Stack>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary">{deck.cardCount || 0} cards</Typography>
                <Typography variant="caption" fontWeight={900}>{progress}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 999 }} />
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<PlayArrow />} disabled={!deck.cardCount} onClick={() => navigate(`/study/${deck._id}`)} sx={{ flex: 1 }}>
                Flashcards
              </Button>
              <Button variant="outlined" startIcon={<Quiz />} disabled={!deck.cardCount} onClick={() => navigate(`/quiz/${deck._id}`)} sx={{ flex: 1, color: 'text.primary' }}>
                Quiz
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { setAnchorEl(null); navigate(`/decks/${deck._id}`); }}>
          <AutoStories sx={{ mr: 1.5, fontSize: 18 }} /> View cards
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); navigate(`/decks/${deck._id}/edit`); }}>
          <Edit sx={{ mr: 1.5, fontSize: 18 }} /> Edit world
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); setConfirmDelete(true); }} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1.5, fontSize: 18 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete "{deck.title}"?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">This will permanently delete the world and all cards.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} variant="outlined">Cancel</Button>
          <Button onClick={() => { onDelete(deck._id); setConfirmDelete(false); }} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const DecksPage = () => {
  const navigate = useNavigate();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    deckAPI.getAll()
      .then(({ data }) => setDecks(data.data.decks))
      .catch(() => setError('Failed to load learning worlds.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await deckAPI.delete(id);
      setDecks((prev) => prev.filter((deck) => deck._id !== id));
    } catch {
      setError('Failed to delete world.');
    }
  };

  const filtered = decks.filter((deck) =>
    deck.title.toLowerCase().includes(search.toLowerCase()) ||
    (deck.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ py: 3, px: { xs: 2, md: 4 }, maxWidth: 1180, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">My Learning Worlds</Typography>
          <Typography variant="body2" color="text.secondary">{decks.length} worlds ready for practice</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/decks/new')}>New world</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        placeholder="Search worlds..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, maxWidth: 420 }}
        fullWidth
        InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
      />

      {loading ? (
        <Grid container spacing={2}>{[1, 2, 3].map((item) => <Grid item xs={12} md={4} key={item}><Skeleton variant="rounded" height={290} /></Grid>)}</Grid>
      ) : filtered.length > 0 ? (
        <Grid container spacing={2}>
          {filtered.map((deck) => (
            <Grid item xs={12} sm={6} lg={4} key={deck._id}>
              <DeckCard deck={deck} onDelete={handleDelete} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card sx={{ border: '1px dashed', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.68)' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h5" gutterBottom>{search ? 'No worlds match your search' : 'No learning worlds yet'}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{search ? 'Try another topic.' : 'Create starter content to begin learning.'}</Typography>
            {!search && <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/decks/new')}>Create world</Button>}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DecksPage;
