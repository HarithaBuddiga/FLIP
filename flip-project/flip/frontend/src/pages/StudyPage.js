import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert, Box, Button, CircularProgress, LinearProgress,
  Stack, Typography,
} from '@mui/material';
import {
  ArrowBack, CheckCircle, PlayArrow, Replay, VolumeUp,
} from '@mui/icons-material';
import { cardAPI, deckAPI, reviewAPI } from '../services/api';

const speakText = (text) => {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  return true;
};

const FlipCard = ({ card, isFlipped, onClick, onPronounce }) => (
  <Box onClick={onClick} sx={{ width: '100%', maxWidth: 430, height: { xs: 420, sm: 500 }, perspective: '1000px', cursor: 'pointer', userSelect: 'none' }}>
    <Box sx={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
      <Box sx={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: 'linear-gradient(155deg, rgba(255,255,255,0.9), rgba(236,230,255,0.74))', border: '1px solid rgba(255,255,255,0.8)', borderRadius: 7, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center', boxShadow: '0 28px 80px rgb(76 29 149 / 0.22)' }}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2 }}>
          Flashcard
        </Typography>
        <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1.15, color: 'primary.main' }}>
          {card.front}
        </Typography>
        <Button variant="outlined" startIcon={<VolumeUp />} sx={{ mt: 3 }} onClick={(e) => { e.stopPropagation(); onPronounce(card.front); }}>
          Pronounce
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 3 }}>
          Tap to reveal
        </Typography>
      </Box>

      <Box sx={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'linear-gradient(155deg, #061D42 0%, #0A2F6B 56%, #14B8A6 100%)', color: 'white', border: '1px solid rgba(255,255,255,0.28)', borderRadius: 7, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center', boxShadow: '0 28px 80px rgb(10 47 107 / 0.26)' }}>
        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2, color: 'rgba(255,255,255,0.75)' }}>
          Answer
        </Typography>
        <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1.35 }}>
          {card.back}
        </Typography>
        <Button variant="outlined" startIcon={<VolumeUp />} sx={{ mt: 3, color: 'white', borderColor: 'rgba(255,255,255,0.46)' }} onClick={(e) => { e.stopPropagation(); onPronounce(card.back); }}>
          Pronounce
        </Button>
        <Typography variant="caption" sx={{ mt: 3, color: 'rgba(255,255,255,0.72)' }}>
          Tap to flip back
        </Typography>
      </Box>
    </Box>
  </Box>
);

const StudyComplete = ({ total, onRestart, onBack, canReview }) => (
  <Box sx={{ textAlign: 'center', maxWidth: 430, mx: 'auto' }}>
    <CheckCircle sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
    <Typography variant="h3" gutterBottom>Session complete</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
      {canReview
        ? `You reviewed ${total} card${total !== 1 ? 's' : ''}.`
        : `You viewed ${total} card${total !== 1 ? 's' : ''}.`}
    </Typography>
    <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
      <Button variant="contained" startIcon={<Replay />} onClick={onRestart}>Study again</Button>
      <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBack}>Back to world</Button>
    </Stack>
  </Box>
);

const StudyPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [canReview, setCanReview] = useState(false);

  const fetchCards = useCallback(async (all = false) => {
    setLoading(true);
    setError('');
    try {
      const [deckRes, cardsRes] = await Promise.all([
        deckAPI.getOne(deckId),
        (all ? cardAPI.getByDeck : cardAPI.getDue)(deckId),
      ]);
      setCanReview(deckRes.data.data.isOwner);
      setCards(cardsRes.data.data.cards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setCompleted(cardsRes.data.data.cards.length === 0);
      setReviewedCount(0);
    } catch {
      setError('Failed to load cards.');
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => { fetchCards(false); }, [fetchCards]);

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;

  const handleReview = async (rating) => {
    if (!currentCard || submitting) return;
    if (!canReview) {
      setError('Only the owner can submit review ratings for this world.');
      return;
    }
    setSubmitting(true);
    try {
      await reviewAPI.submit(currentCard._id, rating);
      setReviewedCount((value) => value + 1);
      if (currentIndex + 1 >= cards.length) {
        setCompleted(true);
      } else {
        setCurrentIndex((value) => value + 1);
        setIsFlipped(false);
      }
    } catch {
      setError('Failed to record review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvance = () => {
    if (currentIndex + 1 >= cards.length) {
      setCompleted(true);
    } else {
      setCurrentIndex((value) => value + 1);
      setIsFlipped(false);
    }
  };

  const handlePronounce = (text) => {
    const didSpeak = speakText(text);
    if (!didSpeak) {
      setError('Pronunciation is not supported in this browser.');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 20%, rgba(20,184,166,0.20), transparent 34%), linear-gradient(180deg, #FFFFFF 0%, #EEF6F7 100%)' }}>
      <Box sx={{ bgcolor: 'rgba(255,255,255,0.76)', backdropFilter: 'blur(18px)', borderBottom: '1px solid', borderColor: 'divider', px: { xs: 2, md: 4 }, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/study-hub')} size="small" sx={{ color: 'text.secondary' }}>Exit</Button>
        {!completed && cards.length > 0 && <Typography variant="body2" fontWeight={800}>{currentIndex + 1} / {cards.length}</Typography>}
        <Box sx={{ width: 64 }} />
      </Box>

      {!completed && cards.length > 0 && (
        <LinearProgress variant="determinate" value={progress} sx={{ height: 5, bgcolor: 'rgba(10,47,107,0.10)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #0A2F6B, #14B8A6)' } }} />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', px: 2, py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3, maxWidth: 560, width: '100%' }}>{error}</Alert>}

        {completed ? (
          <StudyComplete total={canReview ? reviewedCount : cards.length} onRestart={() => { setCompleted(false); fetchCards(true); }} onBack={() => navigate('/study-hub')} canReview={canReview} />
        ) : cards.length === 0 ? (
          <Box sx={{ textAlign: 'center', maxWidth: 420 }}>
            <CheckCircle sx={{ fontSize: 58, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" gutterBottom>All caught up</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>No cards are due right now.</Typography>
            <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
              <Button variant="contained" startIcon={<PlayArrow />} onClick={() => fetchCards(true)}>Study all cards</Button>
              <Button variant="outlined" onClick={() => navigate('/study-hub')}>Learning hub</Button>
            </Stack>
          </Box>
        ) : (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <FlipCard card={currentCard} isFlipped={isFlipped} onClick={() => setIsFlipped((value) => !value)} onPronounce={handlePronounce} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} justifyContent="center" sx={{ width: '100%', maxWidth: 620 }}>
              <Button variant="outlined" onClick={() => { setCurrentIndex((value) => Math.max(0, value - 1)); setIsFlipped(false); }} disabled={currentIndex === 0 || submitting}>Previous</Button>
              {isFlipped && canReview ? (
                <>
                  <Button variant="outlined" onClick={() => handleReview('hard')} disabled={submitting} sx={{ color: '#DC2626', borderColor: '#FCA5A5' }}>Hard</Button>
                  <Button variant="outlined" onClick={() => handleReview('good')} disabled={submitting} sx={{ color: '#059669', borderColor: '#6EE7B7' }}>Good</Button>
                  <Button variant="outlined" onClick={() => handleReview('easy')} disabled={submitting} sx={{ color: '#0A2F6B', borderColor: '#8BDDD4' }}>Easy</Button>
                </>
              ) : isFlipped ? (
                <Button variant="contained" onClick={handleAdvance}>{currentIndex + 1 >= cards.length ? 'Finish' : 'Next card'}</Button>
              ) : (
                <Button variant="contained" onClick={() => setIsFlipped(true)}>Flip card</Button>
              )}
              <Button variant="outlined" onClick={() => { setCurrentIndex((value) => Math.min(cards.length - 1, value + 1)); setIsFlipped(false); }} disabled={currentIndex + 1 >= cards.length || submitting}>Next</Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StudyPage;
