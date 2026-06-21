const assert = require('assert');
const { getLevelFromXp, toProgressStats } = require('../utils/progress');

assert.strictEqual(getLevelFromXp(0), 1);
assert.strictEqual(getLevelFromXp(249), 1);
assert.strictEqual(getLevelFromXp(250), 2);
assert.strictEqual(getLevelFromXp(500), 3);

const stats = toProgressStats({
  xp: 500,
  streak: 3,
  cardsReviewed: 12,
  quizzesCompleted: 2,
  quizCorrectAnswers: 7,
  quizTotalQuestions: 10,
  lastActivityDate: null,
});

assert.strictEqual(stats.level, 3);
assert.strictEqual(stats.accuracy, 70);
assert.strictEqual(stats.streak, 3);

console.log('Progress tests passed.');
