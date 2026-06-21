import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Handle 401 globally — redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
};

// ── Decks ─────────────────────────────────────────────────
export const deckAPI = {
  getAll: () => API.get('/decks'),
  getOne: (id) => API.get(`/decks/${id}`),
  getPublic: () => API.get('/decks/public'),
  create: (data) => API.post('/decks', data),
  clone: (id) => API.post(`/decks/${id}/clone`),
  update: (id, data) => API.put(`/decks/${id}`, data),
  delete: (id) => API.delete(`/decks/${id}`),
};

// ── Cards ─────────────────────────────────────────────────
export const cardAPI = {
  getByDeck: (deckId) => API.get(`/cards/${deckId}`),
  getDue: (deckId) => API.get(`/cards/${deckId}/due`),
  create: (data) => API.post('/cards', data),
  bulkCreate: (data) => API.post('/cards/bulk', data),
  update: (id, data) => API.put(`/cards/${id}`, data),
  delete: (id) => API.delete(`/cards/${id}`),
};

// ── Reviews ───────────────────────────────────────────────
export const reviewAPI = {
  submit: (cardId, rating) => API.post(`/review/${cardId}`, { rating }),
  getStats: () => API.get('/review/stats'),
};

// Progress
export const progressAPI = {
  getMe: () => API.get('/progress/me'),
  recordQuizAttempt: (data) => API.post('/progress/quiz-attempts', data),
};

// Admin
export const adminAPI = {
  getAnalytics: () => API.get('/admin/analytics'),
  getUsers: () => API.get('/admin/users'),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  getDecks: () => API.get('/admin/decks'),
  createDeck: (data) => API.post('/admin/decks', data),
  updateDeck: (id, data) => API.put(`/admin/decks/${id}`, data),
  deleteDeck: (id) => API.delete(`/admin/decks/${id}`),
  getCards: (deckId) => API.get(`/admin/decks/${deckId}/cards`),
  createCard: (data) => API.post('/admin/cards', data),
  updateCard: (id, data) => API.put(`/admin/cards/${id}`, data),
  deleteCard: (id) => API.delete(`/admin/cards/${id}`),
  createStarterWorlds: () => API.post('/admin/starter-worlds'),
};

export default API;
