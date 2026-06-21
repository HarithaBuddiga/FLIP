import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem,
  Stack, TextField, Typography,
} from '@mui/material';
import {
  Add, AdminPanelSettings, AutoStories, Delete, Edit, PublishedWithChanges,
  Save, Search, Stars, UploadFile,
} from '@mui/icons-material';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const parseBulkCards = (text) => text
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const csvMatch = line.match(/^"?(.*?)"?\s*,\s*"?(.*?)"?$/);
    const separator = [' - ', ' = ', ': ', '\t'].find((item) => line.includes(item));
    if (csvMatch && csvMatch[1] && csvMatch[2]) return { front: csvMatch[1].trim(), back: csvMatch[2].trim() };
    if (separator) {
      const [front, ...rest] = line.split(separator);
      return { front: front.trim(), back: rest.join(separator).trim() };
    }
    return { front: line, back: '' };
  });

const StatCard = ({ label, value, icon }) => (
  <Card>
    <CardContent sx={{ p: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ width: 42, height: 42, borderRadius: 3, display: 'grid', placeItems: 'center', color: 'white', background: 'linear-gradient(135deg, #0A2F6B, #14B8A6)' }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          <Typography variant="h5">{value ?? 0}</Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const CardEditorDialog = ({ open, card, deckId, onClose, onSaved }) => {
  const [form, setForm] = useState({ front: '', back: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(card ? { front: card.front || '', back: card.back || '' } : { front: '', back: '' });
      setError('');
    }
  }, [open, card]);

  const handleSave = async () => {
    if (!form.front.trim() || !form.back.trim()) {
      setError('Front and back are required.');
      return;
    }
    setSaving(true);
    try {
      if (card?._id) {
        await adminAPI.updateCard(card._id, form);
      } else {
        await adminAPI.createCard({ ...form, deckId });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save card.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{card ? 'Edit card' : 'Add card'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Front" value={form.front} onChange={(e) => setForm((p) => ({ ...p, front: e.target.value }))} multiline rows={3} />
          <TextField label="Back" value={form.back} onChange={(e) => setForm((p) => ({ ...p, back: e.target.value }))} multiline rows={3} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
};

const BulkImportDialog = ({ open, deckId, existingCards, onClose, onImported }) => {
  const [rawText, setRawText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setRawText('');
      setError('');
    }
  }, [open]);

  const parsed = parseBulkCards(rawText);
  const existingKeys = new Set(existingCards.map((card) => `${card.front.trim().toLowerCase()}::${card.back.trim().toLowerCase()}`));
  const seen = new Set();
  const preview = parsed.map((card) => {
    const key = `${card.front.toLowerCase()}::${card.back.toLowerCase()}`;
    const isInvalid = !card.front || !card.back;
    const isDuplicate = existingKeys.has(key) || seen.has(key);
    if (!isInvalid && !isDuplicate) seen.add(key);
    return { ...card, isInvalid, isDuplicate };
  });
  const ready = preview.filter((card) => !card.isInvalid && !card.isDuplicate).map(({ front, back }) => ({ front, back }));

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(csv|txt)$/i.test(file.name)) {
      setError('Please upload a .csv or .txt file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setRawText(String(reader.result || ''));
    reader.onerror = () => setError('Could not read the selected file.');
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleImport = async () => {
    if (ready.length === 0) {
      setError('No valid non-duplicate cards are ready.');
      return;
    }
    setSaving(true);
    try {
      for (const card of ready) {
        await adminAPI.createCard({ deckId, ...card });
      }
      onImported();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import cards.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Admin bulk import</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <Button variant="outlined" component="label" startIcon={<UploadFile />}>
            Upload CSV/TXT
            <input type="file" hidden accept=".csv,.txt,text/csv,text/plain" onChange={handleFileUpload} />
          </Button>
          <Chip label={`${ready.length} ready`} color="secondary" />
          <Chip label={`${preview.filter((item) => item.isDuplicate).length} duplicates`} variant="outlined" />
          <Chip label={`${preview.filter((item) => item.isInvalid).length} incomplete`} variant="outlined" color="warning" />
        </Stack>
        <TextField
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          fullWidth
          multiline
          minRows={8}
          placeholder={'word - meaning\naccurate, correct or exact\nresilient: able to recover quickly'}
        />
        {preview.length > 0 && (
          <Stack spacing={1} sx={{ mt: 2, maxHeight: 240, overflow: 'auto' }}>
            {preview.slice(0, 60).map((item, index) => (
              <Box key={`${item.front}-${index}`} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 1, p: 1, borderRadius: 2, bgcolor: 'grey.50' }}>
                <Typography variant="caption">{item.front || '-'}</Typography>
                <Typography variant="caption">{item.back || '-'}</Typography>
                <Chip size="small" label={item.isInvalid ? 'Incomplete' : item.isDuplicate ? 'Duplicate' : 'Ready'} />
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleImport} disabled={saving || ready.length === 0}>
          {saving ? 'Importing...' : `Import ${ready.length}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [selectedCards, setSelectedCards] = useState([]);
  const [deckSearch, setDeckSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cardDialog, setCardDialog] = useState({ open: false, card: null });
  const [bulkOpen, setBulkOpen] = useState(false);
  const [deckForm, setDeckForm] = useState({
    title: '',
    description: '',
    category: 'Language',
    difficulty: 'Beginner',
    isOfficial: true,
    isFeatured: true,
  });
  const [editDeckForm, setEditDeckForm] = useState(null);

  const selectedDeck = decks.find((deck) => deck._id === selectedDeckId) || null;

  const filteredDecks = useMemo(() => {
    const query = deckSearch.toLowerCase();
    return decks.filter((deck) =>
      deck.title.toLowerCase().includes(query) ||
      (deck.category || '').toLowerCase().includes(query) ||
      (deck.createdBy?.name || '').toLowerCase().includes(query) ||
      (deck.createdBy?.email || '').toLowerCase().includes(query)
    );
  }, [decks, deckSearch]);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [analyticsRes, usersRes, decksRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getUsers(),
        adminAPI.getDecks(),
      ]);
      setAnalytics(analyticsRes.data.data);
      setUsers(usersRes.data.data.users);
      setDecks(decksRes.data.data.decks);
      if (!selectedDeckId && decksRes.data.data.decks[0]) {
        setSelectedDeckId(decksRes.data.data.decks[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, [selectedDeckId]);

  const loadCards = useCallback(async (deckId = selectedDeckId) => {
    if (!deckId) {
      setSelectedCards([]);
      return;
    }
    setCardsLoading(true);
    try {
      const { data } = await adminAPI.getCards(deckId);
      setSelectedCards(data.data.cards);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cards.');
    } finally {
      setCardsLoading(false);
    }
  }, [selectedDeckId]);

  useEffect(() => { loadAdminData(); }, [loadAdminData]);
  useEffect(() => {
    if (selectedDeckId) loadCards(selectedDeckId);
  }, [loadCards, selectedDeckId]);
  useEffect(() => {
    if (selectedDeck) {
      setEditDeckForm({
        title: selectedDeck.title || '',
        description: selectedDeck.description || '',
        category: selectedDeck.category || 'General',
        difficulty: selectedDeck.difficulty || 'Beginner',
        isPublic: Boolean(selectedDeck.isPublic),
        isOfficial: Boolean(selectedDeck.isOfficial),
        isFeatured: Boolean(selectedDeck.isFeatured),
      });
    }
  }, [selectedDeckId, selectedDeck]);

  if (user?.role !== 'admin') {
    return <Box sx={{ p: 3 }}><Alert severity="error">Admin access required.</Alert></Box>;
  }

  const handleCreateDeck = async () => {
    if (!deckForm.title.trim()) {
      setError('Official world title is required.');
      return;
    }
    try {
      const { data } = await adminAPI.createDeck({ ...deckForm, isPublic: true });
      setDeckForm((prev) => ({ ...prev, title: '', description: '' }));
      setSelectedDeckId(data.data.deck._id);
      setMessage('Official world created.');
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create official world.');
    }
  };

  const handleSaveSelectedDeck = async () => {
    if (!selectedDeck || !editDeckForm?.title.trim()) return;
    try {
      await adminAPI.updateDeck(selectedDeck._id, editDeckForm);
      setMessage('World updated.');
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update world.');
    }
  };

  const handleUserRole = async (id, role) => {
    await adminAPI.updateUser(id, { role });
    loadAdminData();
  };

  const handleToggleDeck = async (deck, field) => {
    await adminAPI.updateDeck(deck._id, { [field]: !deck[field], ...(field === 'isOfficial' && !deck[field] ? { isPublic: true } : {}) });
    loadAdminData();
  };

  const handleDeleteDeck = async (id) => {
    await adminAPI.deleteDeck(id);
    if (selectedDeckId === id) {
      setSelectedDeckId('');
      setSelectedCards([]);
    }
    setMessage('World deleted.');
    loadAdminData();
  };

  const handleDeleteCard = async (id) => {
    await adminAPI.deleteCard(id);
    setMessage('Card deleted.');
    loadCards();
    loadAdminData();
  };

  const handleStarterWorlds = async () => {
    await adminAPI.createStarterWorlds();
    setMessage('Starter worlds are ready.');
    loadAdminData();
  };

  if (loading) {
    return <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ py: 3, px: { xs: 2, md: 4 }, maxWidth: 1280, mx: 'auto' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <AdminPanelSettings color="primary" />
            <Typography variant="h4">Admin Content Manager</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">Manage users, official worlds, user-created decks, cards, imports, and platform health.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Stars />} onClick={handleStarterWorlds}>Create starter worlds</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>{message}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2}><StatCard label="Users" value={analytics?.users} icon={<AdminPanelSettings />} /></Grid>
        <Grid item xs={6} md={2}><StatCard label="Decks" value={analytics?.decks} icon={<AutoStories />} /></Grid>
        <Grid item xs={6} md={2}><StatCard label="Cards" value={analytics?.cards} icon={<AutoStories />} /></Grid>
        <Grid item xs={6} md={2}><StatCard label="Public" value={analytics?.publicDecks} icon={<PublishedWithChanges />} /></Grid>
        <Grid item xs={6} md={2}><StatCard label="Official" value={analytics?.officialDecks} icon={<Stars />} /></Grid>
        <Grid item xs={6} md={2}><StatCard label="Quizzes" value={analytics?.quizAttempts} icon={<Save />} /></Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h5" gutterBottom>Create Official World</Typography>
                <Stack spacing={1.5}>
                  <TextField label="Title" value={deckForm.title} onChange={(e) => setDeckForm((p) => ({ ...p, title: e.target.value }))} />
                  <TextField label="Description" multiline rows={3} value={deckForm.description} onChange={(e) => setDeckForm((p) => ({ ...p, description: e.target.value }))} />
                  <TextField label="Category" value={deckForm.category} onChange={(e) => setDeckForm((p) => ({ ...p, category: e.target.value }))} />
                  <TextField select label="Difficulty" value={deckForm.difficulty} onChange={(e) => setDeckForm((p) => ({ ...p, difficulty: e.target.value }))}>
                    {['Beginner', 'Intermediate', 'Advanced'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                  <Button variant="contained" onClick={handleCreateDeck}>Create world</Button>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h5" gutterBottom>User Management</Typography>
                <Stack spacing={1}>
                  {users.slice(0, 8).map((item) => (
                    <Box key={item._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, p: 1.25, borderRadius: 3, bgcolor: 'grey.50' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={900}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.email}</Typography>
                      </Box>
                      <TextField select size="small" value={item.role || 'user'} onChange={(e) => handleUserRole(item._id, e.target.value)} sx={{ width: 120 }}>
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </TextField>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h5">Worlds & User Decks</Typography>
                  <Typography variant="body2" color="text.secondary">Select any world to edit its metadata and manage cards.</Typography>
                </Box>
                <TextField
                  size="small"
                  placeholder="Search decks..."
                  value={deckSearch}
                  onChange={(e) => setDeckSearch(e.target.value)}
                  InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
                  sx={{ minWidth: { sm: 260 } }}
                />
              </Stack>
              <Stack spacing={1.25} sx={{ maxHeight: 360, overflow: 'auto' }}>
                {filteredDecks.map((deck) => (
                  <Box
                    key={deck._id}
                    onClick={() => setSelectedDeckId(deck._id)}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
                      gap: 1.5,
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: 3,
                      cursor: 'pointer',
                      bgcolor: selectedDeckId === deck._id ? 'rgba(20,184,166,0.12)' : 'grey.50',
                      border: '1px solid',
                      borderColor: selectedDeckId === deck._id ? 'secondary.main' : 'transparent',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={900}>{deck.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{deck.createdBy?.name || 'Unknown'} - {deck.cardCount || 0} cards - {deck.category || 'General'}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap onClick={(event) => event.stopPropagation()}>
                      <Chip label={deck.isPublic ? 'Public' : 'Private'} onClick={() => handleToggleDeck(deck, 'isPublic')} />
                      <Chip color={deck.isOfficial ? 'secondary' : 'default'} label={deck.isOfficial ? 'Official' : 'Make official'} onClick={() => handleToggleDeck(deck, 'isOfficial')} />
                      <Chip color={deck.isFeatured ? 'warning' : 'default'} label={deck.isFeatured ? 'Featured' : 'Feature'} onClick={() => handleToggleDeck(deck, 'isFeatured')} />
                      <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDeleteDeck(deck._id)}>Delete</Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {selectedDeck && editDeckForm && (
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h5">Manage Selected World</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedDeck.title}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<UploadFile />} onClick={() => setBulkOpen(true)}>Bulk import</Button>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setCardDialog({ open: true, card: null })}>Add card</Button>
                  </Stack>
                </Stack>

                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}><TextField label="Title" fullWidth value={editDeckForm.title} onChange={(e) => setEditDeckForm((p) => ({ ...p, title: e.target.value }))} /></Grid>
                  <Grid item xs={12} sm={3}><TextField label="Category" fullWidth value={editDeckForm.category} onChange={(e) => setEditDeckForm((p) => ({ ...p, category: e.target.value }))} /></Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField select label="Difficulty" fullWidth value={editDeckForm.difficulty} onChange={(e) => setEditDeckForm((p) => ({ ...p, difficulty: e.target.value }))}>
                      {['Beginner', 'Intermediate', 'Advanced'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}><TextField label="Description" fullWidth multiline rows={2} value={editDeckForm.description} onChange={(e) => setEditDeckForm((p) => ({ ...p, description: e.target.value }))} /></Grid>
                </Grid>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  <Chip label={editDeckForm.isPublic ? 'Public' : 'Private'} color={editDeckForm.isPublic ? 'secondary' : 'default'} onClick={() => setEditDeckForm((p) => ({ ...p, isPublic: !p.isPublic }))} />
                  <Chip label={editDeckForm.isOfficial ? 'Official' : 'Not official'} color={editDeckForm.isOfficial ? 'secondary' : 'default'} onClick={() => setEditDeckForm((p) => ({ ...p, isOfficial: !p.isOfficial, isPublic: !p.isOfficial ? true : p.isPublic }))} />
                  <Chip label={editDeckForm.isFeatured ? 'Featured' : 'Not featured'} color={editDeckForm.isFeatured ? 'warning' : 'default'} onClick={() => setEditDeckForm((p) => ({ ...p, isFeatured: !p.isFeatured }))} />
                  <Button variant="contained" startIcon={<Save />} onClick={handleSaveSelectedDeck}>Save world</Button>
                </Stack>

                <Typography variant="h6" gutterBottom>Cards</Typography>
                {cardsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Stack spacing={1} sx={{ maxHeight: 420, overflow: 'auto' }}>
                    {selectedCards.map((card) => (
                      <Box key={card._id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr auto' }, gap: 1, alignItems: 'center', p: 1.25, borderRadius: 3, bgcolor: 'grey.50' }}>
                        <Typography variant="body2" fontWeight={800}>{card.front}</Typography>
                        <Typography variant="body2" color="text.secondary">{card.back}</Typography>
                        <Stack direction="row" spacing={1}>
                          <Button size="small" startIcon={<Edit />} onClick={() => setCardDialog({ open: true, card })}>Edit</Button>
                          <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleDeleteCard(card._id)}>Delete</Button>
                        </Stack>
                      </Box>
                    ))}
                    {selectedCards.length === 0 && (
                      <Alert severity="info">No cards yet. Add a card or bulk import content into this world.</Alert>
                    )}
                  </Stack>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <CardEditorDialog
        open={cardDialog.open}
        card={cardDialog.card}
        deckId={selectedDeckId}
        onClose={() => setCardDialog({ open: false, card: null })}
        onSaved={() => { loadCards(); loadAdminData(); setMessage('Card saved.'); }}
      />
      <BulkImportDialog
        open={bulkOpen}
        deckId={selectedDeckId}
        existingCards={selectedCards}
        onClose={() => setBulkOpen(false)}
        onImported={() => { loadCards(); loadAdminData(); setMessage('Cards imported.'); }}
      />
    </Box>
  );
};

export default AdminPage;
