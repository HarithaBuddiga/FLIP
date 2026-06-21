import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Chip, Stack, Card, CardContent, Grid,
  IconButton, Menu, MenuItem, Alert, Skeleton, Divider, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import {
  Add, Edit, Delete, PlayArrow, MoreVert, ArrowBack, Public, Lock, UploadFile,
} from '@mui/icons-material';
import { deckAPI, cardAPI } from '../services/api';

const ENGLISH_SUGGESTIONS = {
  abundant: 'Existing in large quantities.',
  accurate: 'Correct or exact.',
  brief: 'Short in time or length.',
  resilient: 'Able to recover quickly from difficulty.',
  improve: 'To make something better.',
  journey: 'An act of traveling from one place to another.',
  destination: 'The place someone is going to.',
  luggage: 'Bags used when traveling.',
  reservation: 'An arrangement made in advance.',
  efficient: 'Working well without wasting time or effort.',
  curious: 'Eager to know or learn something.',
  confident: 'Feeling sure about your ability or decision.',
};

const CardItem = ({ card, isOwner, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      sx={{ cursor: 'pointer', '&:hover': { borderColor: 'grey.300' } }}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight={500}>{card.front}</Typography>
            {expanded && (
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                  Answer
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.25 }}>{card.back}</Typography>
              </Box>
            )}
          </Box>
          {isOwner && (
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }} sx={{ ml: 1, mt: -0.5 }}>
              <MoreVert sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>
        {card.reviewCount > 0 && (
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
            <Chip label={`${card.reviewCount} review${card.reviewCount !== 1 ? 's' : ''}`} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
          </Box>
        )}
      </CardContent>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: 3 } }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); onEdit(card); }}>
          <Edit sx={{ mr: 1.5, fontSize: 16 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onDelete(card._id); }} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1.5, fontSize: 16 }} /> Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

// Modal for Add/Edit Card
const CardModal = ({ open, onClose, onSave, editCard, deckId }) => {
  const [form, setForm] = useState({ front: '', back: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(editCard ? { front: editCard.front, back: editCard.back } : { front: '', back: '' });
      setError('');
    }
  }, [open, editCard]);

  const handleSave = async () => {
    if (!form.front.trim() || !form.back.trim()) {
      setError('Both front and back are required.');
      return;
    }
    setLoading(true);
    try {
      if (editCard) {
        const { data } = await cardAPI.update(editCard._id, form);
        onSave(data.data.card, 'edit');
      } else {
        const { data } = await cardAPI.create({ ...form, deckId });
        onSave(data.data.card, 'add');
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save card.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestMeaning = () => {
    const key = form.front.trim().toLowerCase();
    if (!key) {
      setError('Type an English word first, then ask for a suggestion.');
      return;
    }
    const suggestion = ENGLISH_SUGGESTIONS[key];
    if (!suggestion) {
      setError('No local suggestion found for this word yet. You can still type your own meaning.');
      return;
    }
    setForm((prev) => ({ ...prev, back: suggestion }));
    setError('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle fontWeight={600}>{editCard ? 'Edit card' : 'Add card'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
          <TextField
            label="Front (question or term)"
            value={form.front}
            onChange={(e) => setForm((p) => ({ ...p, front: e.target.value }))}
            fullWidth
            multiline
            rows={3}
            autoFocus
            placeholder="e.g., What is photosynthesis?"
          />
          <TextField
            label="Back (answer or definition)"
            value={form.back}
            onChange={(e) => setForm((p) => ({ ...p, back: e.target.value }))}
            fullWidth
            multiline
            rows={3}
            placeholder="e.g., The process by which plants convert sunlight into energy"
          />
          {!editCard && (
            <Button variant="outlined" onClick={handleSuggestMeaning} sx={{ alignSelf: 'flex-start' }}>
              Suggest meaning
            </Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: 'divider', color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={18} color="inherit" /> : (editCard ? 'Save changes' : 'Add card')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const parseBulkCards = (text) => {
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return rows.map((line) => {
    const csvMatch = line.match(/^"?(.*?)"?\s*,\s*"?(.*?)"?$/);
    const separator = [' - ', ' = ', ': ', '\t'].find((item) => line.includes(item));

    if (csvMatch && csvMatch[1] && csvMatch[2]) {
      return { front: csvMatch[1].trim(), back: csvMatch[2].trim() };
    }

    if (separator) {
      const [front, ...rest] = line.split(separator);
      return { front: front.trim(), back: rest.join(separator).trim() };
    }

    return { front: line, back: '' };
  });
};

const BulkCardModal = ({ open, onClose, deckId, existingCards, onImported }) => {
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setRawText('');
      setError('');
    }
  }, [open]);

  const parsedCards = parseBulkCards(rawText);
  const existingKeys = new Set(existingCards.map((card) => `${card.front.trim().toLowerCase()}::${card.back.trim().toLowerCase()}`));
  const seenKeys = new Set();
  const preview = parsedCards.map((card) => {
    const key = `${card.front.toLowerCase()}::${card.back.toLowerCase()}`;
    const isInvalid = !card.front || !card.back;
    const isDuplicate = existingKeys.has(key) || seenKeys.has(key);
    if (!isInvalid && !isDuplicate) seenKeys.add(key);
    return { ...card, isInvalid, isDuplicate };
  });
  const importableCards = preview.filter((card) => !card.isInvalid && !card.isDuplicate).map(({ front, back }) => ({ front, back }));
  const duplicateCount = preview.filter((card) => card.isDuplicate).length;
  const invalidCount = preview.filter((card) => card.isInvalid).length;

  const handleImport = async () => {
    if (importableCards.length === 0) {
      setError('No valid non-duplicate cards are ready to import.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await cardAPI.bulkCreate({ deckId, cards: importableCards });
      onImported(data.data.cards);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import cards.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!/\.(csv|txt)$/i.test(file.name)) {
      setError('Please upload a .csv or .txt file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawText(String(reader.result || ''));
      setError('');
    };
    reader.onerror = () => setError('Could not read the selected file.');
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle fontWeight={800}>Bulk import cards</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Paste one card per line. Supported formats: word - meaning, word = meaning, word: meaning, or CSV as word,meaning.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>
            Upload CSV/TXT
            <input type="file" hidden accept=".csv,.txt,text/csv,text/plain" onChange={handleFileUpload} />
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
            Files are parsed in your browser before import.
          </Typography>
        </Stack>
        <TextField
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          fullWidth
          multiline
          minRows={7}
          placeholder={'abundant - existing in large quantities\nbrief, short in duration\naccurate: correct or exact'}
        />

        {preview.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
              <Chip label={`${importableCards.length} ready`} color="secondary" />
              {duplicateCount > 0 && <Chip label={`${duplicateCount} duplicates skipped`} color="warning" variant="outlined" />}
              {invalidCount > 0 && <Chip label={`${invalidCount} incomplete`} color="error" variant="outlined" />}
            </Stack>
            <Box sx={{ maxHeight: 260, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Front</TableCell>
                    <TableCell>Back</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.slice(0, 80).map((card, index) => (
                    <TableRow key={`${card.front}-${index}`}>
                      <TableCell>{card.front || '-'}</TableCell>
                      <TableCell>{card.back || '-'}</TableCell>
                      <TableCell>
                        {card.isInvalid ? 'Incomplete' : card.isDuplicate ? 'Duplicate' : 'Ready'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleImport} variant="contained" disabled={loading || importableCards.length === 0}>
          {loading ? <CircularProgress size={18} color="inherit" /> : `Import ${importableCards.length} cards`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DeckDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editCard, setEditCard] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [deckRes, cardsRes] = await Promise.all([
        deckAPI.getOne(id),
        cardAPI.getByDeck(id),
      ]);
      setDeck(deckRes.data.data.deck);
      setIsOwner(deckRes.data.data.isOwner);
      setCards(cardsRes.data.data.cards);
    } catch {
      setError('Failed to load deck.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCardSave = (card, action) => {
    if (action === 'add') {
      setCards((prev) => [card, ...prev]);
      setDeck((d) => ({ ...d, cardCount: (d.cardCount || 0) + 1 }));
    } else {
      setCards((prev) => prev.map((c) => (c._id === card._id ? card : c)));
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await cardAPI.delete(cardId);
      setCards((prev) => prev.filter((c) => c._id !== cardId));
      setDeck((d) => ({ ...d, cardCount: Math.max(0, (d.cardCount || 1) - 1) }));
    } catch {
      setError('Failed to delete card.');
    }
  };

  const handleBulkImported = (createdCards) => {
    setCards((prev) => [...createdCards, ...prev]);
    setDeck((d) => ({ ...d, cardCount: (d.cardCount || 0) + createdCards.length }));
  };

  if (loading) return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width={300} height={24} />
    </Box>
  );

  if (error) return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Button startIcon={<ArrowBack sx={{ fontSize: 16 }} />} onClick={() => navigate('/decks')}
        size="small" sx={{ mb: 3, color: 'text.secondary' }}>
        All decks
      </Button>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>{deck?.title}</Typography>
          {deck?.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {deck.description}
            </Typography>
          )}
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={deck?.category || 'General'} size="small" />
            <Chip
              icon={deck?.isPublic ? <Public sx={{ fontSize: '14px !important' }} /> : <Lock sx={{ fontSize: '14px !important' }} />}
              label={deck?.isPublic ? 'Public' : 'Private'}
              size="small"
              color={deck?.isPublic ? 'secondary' : 'default'}
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              {cards.length} card{cards.length !== 1 ? 's' : ''}
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1}>
          {isOwner && (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Edit sx={{ fontSize: 16 }} />}
                onClick={() => navigate(`/decks/${id}/edit`)}
                sx={{ borderColor: 'divider', color: 'text.secondary' }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add sx={{ fontSize: 16 }} />}
                onClick={() => { setEditCard(null); setModalOpen(true); }}
              >
                Add card
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<UploadFile sx={{ fontSize: 16 }} />}
                onClick={() => setBulkOpen(true)}
              >
                Bulk import
              </Button>
            </>
          )}
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayArrow sx={{ fontSize: 16 }} />}
            onClick={() => navigate(`/study/${id}`)}
            disabled={cards.length === 0}
          >
            Study
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Cards */}
      {cards.length > 0 ? (
        <Grid container spacing={1.5}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card._id}>
              <CardItem
                card={card}
                isOwner={isOwner}
                onEdit={(c) => { setEditCard(c); setModalOpen(true); }}
                onDelete={handleDeleteCard}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card sx={{ bgcolor: 'grey.50', border: '1px dashed', borderColor: 'divider' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>No cards yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add your first card to start building this deck.
            </Typography>
            {isOwner && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
                <Button variant="contained" startIcon={<Add />} onClick={() => { setEditCard(null); setModalOpen(true); }}>
                  Add first card
                </Button>
                <Button variant="outlined" startIcon={<UploadFile />} onClick={() => setBulkOpen(true)}>
                  Bulk import
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      <CardModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditCard(null); }}
        onSave={handleCardSave}
        editCard={editCard}
        deckId={id}
      />
      <BulkCardModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        deckId={id}
        existingCards={cards}
        onImported={handleBulkImported}
      />
    </Box>
  );
};

export default DeckDetailPage;
