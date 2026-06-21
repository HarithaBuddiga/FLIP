import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, FormControlLabel, Switch,
  Alert, CircularProgress, MenuItem,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { deckAPI } from '../services/api';

const CATEGORIES = ['General', 'Language', 'Science', 'Math', 'History', 'Programming', 'Literature', 'Other'];

const CreateDeckPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // If editing existing deck
  const isEditing = Boolean(id);

  const [form, setForm] = useState({ title: '', description: '', category: 'General', isPublic: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      deckAPI.getOne(id)
        .then(({ data }) => {
          const { deck } = data.data;
          setForm({
            title: deck.title,
            description: deck.description || '',
            category: deck.category || 'General',
            isPublic: deck.isPublic,
          });
        })
        .catch(() => setError('Failed to load deck.'))
        .finally(() => setFetchLoading(false));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please enter a deck title.');
      return;
    }
    setLoading(true);
    try {
      if (isEditing) {
        await deckAPI.update(id, form);
        navigate(`/decks/${id}`);
      } else {
        const { data } = await deckAPI.create(form);
        navigate(`/decks/${data.data.deck._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save deck.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 640, mx: 'auto' }}>
      {/* Breadcrumb */}
      <Button
        startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
        onClick={() => navigate('/decks')}
        sx={{ mb: 3, color: 'text.secondary', fontSize: '0.875rem' }}
        size="small"
      >
        Back to decks
      </Button>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        {isEditing ? 'Edit deck' : 'New deck'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        {isEditing ? 'Update the deck details below.' : 'Create a new deck to organize your flashcards.'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Deck title"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            autoFocus
            placeholder="e.g., Spanish Vocabulary, Calculus Formulas"
            inputProps={{ maxLength: 100 }}
          />

          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            placeholder="What's this deck for? (optional)"
            inputProps={{ maxLength: 500 }}
            helperText={`${form.description.length}/500`}
          />

          <TextField
            select
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            fullWidth
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  name="isPublic"
                  checked={form.isPublic}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>Make this deck public</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Public decks can be discovered and studied by anyone.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', m: 0 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ minWidth: 140 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : (isEditing ? 'Save changes' : 'Create deck')}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/decks')}
              sx={{ borderColor: 'divider', color: 'text.secondary' }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateDeckPage;
