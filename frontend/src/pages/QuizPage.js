import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
  LinearProgress, Stack, Typography,
} from '@mui/material';
import { ArrowBack, CheckCircle, Close, Replay } from '@mui/icons-material';
import { cardAPI, deckAPI, progressAPI } from '../services/api';

const buildOptions = (cards, currentCard) => {
  const otherAnswers = [...new Set(
    cards
      .filter((card) => card._id !== currentCard._id)
      .map((card) => card.back)
      .filter((answer) => answer && answer !== currentCard.back)
  )];

  return [currentCard.back, ...otherAnswers.sort(() => Math.random() - 0.5).slice(0, 3)]
    .filter(Boolean)
    .sort(() => Math.random() - 0.5);
};

const QuizPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resultSaved, setResultSaved] = useState(false);

  useEffect(() => {
    Promise.all([deckAPI.getOne(deckId), cardAPI.getByDeck(deckId)])
      .then(([deckRes, cardsRes]) => {
        setDeck(deckRes.data.data.deck);
        setCards(cardsRes.data.data.cards);
      })
      .catch(() => setError('Failed to load quiz.'))
      .finally(() => setLoading(false));
  }, [deckId]);

  const currentCard = cards[currentIndex];
  const options = useMemo(() => (currentCard ? buildOptions(cards, currentCard) : []), [cards, currentCard]);
  const progress = cards.length > 0 ? ((currentIndex + (answered ? 1 : 0)) / cards.length) * 100 : 0;
  const isComplete = cards.length > 0 && currentIndex >= cards.length;

  const handleAnswer = (answer) => {
    if (answered) return;
    setSelected(answer);
    setAnswered(true);
    if (answer === currentCard.back) setScore((value) => value + 1);
  };

  const handleNext = () => {
    setSelected('');
    setAnswered(false);
    setCurrentIndex((value) => value + 1);
  };

  const handleRestart = () => {
    setSelected('');
    setAnswered(false);
    setScore(0);
    setCurrentIndex(0);
    setResultSaved(false);
  };

  useEffect(() => {
    if (!isComplete || resultSaved) return;

    progressAPI.recordQuizAttempt({
      deckId,
      score,
      totalQuestions: cards.length,
    }).catch(() => {
      // The quiz result is useful, but learners should still see completion if saving fails.
    }).finally(() => setResultSaved(true));
  }, [cards.length, deckId, isComplete, resultSaved, score]);

  if (loading) return <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>;

  if (cards.length < 2) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/study-hub')} sx={{ mb: 3 }}>Learning hub</Button>
        <Card sx={{ maxWidth: 560, mx: 'auto', border: '1px dashed', borderColor: 'divider' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h5" gutterBottom>Quiz needs more cards</Typography>
            <Typography variant="body2" color="text.secondary">Add at least two cards to create answer choices.</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(`/decks/${deckId}`)}>Add cards</Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (isComplete) {
    const percent = Math.round((score / cards.length) * 100);
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
        <Card sx={{ maxWidth: 520, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 68, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h3" gutterBottom>Quiz complete</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>You scored {score} out of {cards.length}</Typography>
            <Typography variant="h2" color="primary.main" sx={{ mb: 3 }}>{percent}%</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
              <Button variant="contained" startIcon={<Replay />} onClick={handleRestart}>Try again</Button>
              <Button variant="outlined" onClick={() => navigate('/study-hub')}>Learning hub</Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #FFFFFF, #EEF6F7)' }}>
      <Box sx={{ bgcolor: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(18px)', borderBottom: '1px solid', borderColor: 'divider', px: { xs: 2, md: 4 }, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/study-hub')} size="small" sx={{ color: 'text.secondary' }}>Exit</Button>
        <Chip label={`${currentIndex + 1} / ${cards.length}`} />
        <Typography variant="body2" fontWeight={900}>Score {score}</Typography>
      </Box>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 5, '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #0A2F6B, #14B8A6)' } }} />

      <Box sx={{ px: 2, py: 5, display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ maxWidth: 640, width: '100%' }}>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {deck?.title || 'Quiz time'}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, mb: 3 }}>
              {currentCard.front}
            </Typography>

            <Stack spacing={1.35}>
              {options.map((option, index) => {
                const isCorrect = option === currentCard.back;
                const isSelected = option === selected;
                const showCorrect = answered && isCorrect;
                const showWrong = answered && isSelected && !isCorrect;

                return (
                  <Button
                    key={option}
                    variant={showCorrect || showWrong || isSelected ? 'contained' : 'outlined'}
                    color={showCorrect ? 'success' : showWrong ? 'error' : 'primary'}
                    onClick={() => handleAnswer(option)}
                    endIcon={showCorrect ? <CheckCircle /> : showWrong ? <Close /> : null}
                    sx={{ justifyContent: 'flex-start', minHeight: 58, px: 2, gap: 1.5, textAlign: 'left', borderColor: 'divider' }}
                  >
                    <Box component="span" sx={{ width: 30, height: 30, borderRadius: '50%', display: 'inline-grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.24)', flexShrink: 0 }}>
                      {String.fromCharCode(65 + index)}
                    </Box>
                    {option}
                  </Button>
                );
              })}
            </Stack>

            {answered && (
              <Alert severity={selected === currentCard.back ? 'success' : 'error'} sx={{ mt: 2 }}>
                {selected === currentCard.back ? 'Correct. Your recall is getting stronger.' : `Not quite. The correct answer is ${currentCard.back}.`}
              </Alert>
            )}

            <Button variant="contained" fullWidth disabled={!answered} onClick={handleNext} sx={{ mt: 3 }}>
              {currentIndex + 1 >= cards.length ? 'Finish quiz' : 'Next question'}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default QuizPage;
