const UserProgress = require('../models/UserProgress');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getLevelFromXp = (xp) => Math.max(1, Math.floor(xp / 250) + 1);

const normalizeDate = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const getNextStreak = (lastActivityDate, currentStreak) => {
  const today = normalizeDate(new Date());
  if (!lastActivityDate) return Math.max(1, currentStreak || 0);

  const last = normalizeDate(lastActivityDate);
  const diffDays = Math.round((today - last) / MS_PER_DAY);

  if (diffDays === 0) return currentStreak || 1;
  if (diffDays === 1) return (currentStreak || 0) + 1;
  return 1;
};

const ensureProgress = async (userId) => {
  let progress = await UserProgress.findOne({ userId });
  if (!progress) {
    progress = await UserProgress.create({ userId });
  }
  return progress;
};

const applyProgressActivity = async (userId, updates = {}) => {
  const progress = await ensureProgress(userId);

  progress.streak = getNextStreak(progress.lastActivityDate, progress.streak);
  progress.lastActivityDate = new Date();
  progress.xp += updates.xp || 0;
  progress.cardsReviewed += updates.cardsReviewed || 0;
  progress.quizzesCompleted += updates.quizzesCompleted || 0;
  progress.quizCorrectAnswers += updates.quizCorrectAnswers || 0;
  progress.quizTotalQuestions += updates.quizTotalQuestions || 0;

  await progress.save();
  return progress;
};

const toProgressStats = (progress) => {
  const quizTotalQuestions = progress.quizTotalQuestions || 0;
  const accuracy = quizTotalQuestions > 0
    ? Math.round((progress.quizCorrectAnswers / quizTotalQuestions) * 100)
    : 0;

  return {
    xp: progress.xp || 0,
    level: getLevelFromXp(progress.xp || 0),
    streak: progress.streak || 0,
    cardsReviewed: progress.cardsReviewed || 0,
    quizzesCompleted: progress.quizzesCompleted || 0,
    quizCorrectAnswers: progress.quizCorrectAnswers || 0,
    quizTotalQuestions,
    accuracy,
    lastActivityDate: progress.lastActivityDate,
  };
};

module.exports = {
  applyProgressActivity,
  ensureProgress,
  getLevelFromXp,
  toProgressStats,
};
