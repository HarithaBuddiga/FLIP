# FLIP — Language Learning Flashcards Platform

A production-quality, full-stack flashcard learning platform built with the MERN stack. Study smarter with a built-in Spaced Repetition System (SRS), smooth card flip animations, deck sharing, and a clean, minimal interface.

---

## Features

- **Authentication** — Register, log in, JWT-protected routes, bcrypt password hashing
- **Deck Management** — Create, edit, delete, and organize flashcard decks by category
- **Card Management** — Add, edit, and delete cards with front/back content
- **Study Mode** — Smooth 3D card flip animation with focus-first design
- **Spaced Repetition (SRS)** — Rate cards as Hard/Good/Easy; next review date updates automatically
- **Public Deck Library** — Share decks publicly or browse and study community decks
- **Dashboard** — Live stats (decks, cards, due today) and recently studied decks
- **Mobile Responsive** — Fully usable on all screen sizes

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React, React Router DOM, Axios, Material UI (MUI) |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB Atlas, Mongoose           |
| Auth       | JWT, bcryptjs                     |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |

---

## Project Structure

```
flip/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, getMe
│   │   ├── deckController.js      # Deck CRUD + public decks
│   │   ├── cardController.js      # Card CRUD + due cards
│   │   └── reviewController.js    # SRS review + dashboard stats
│   ├── middleware/
│   │   ├── auth.js                # JWT protect middleware
│   │   └── errorHandler.js        # Central error + 404 handler
│   ├── models/
│   │   ├── User.js                # User schema with bcrypt hook
│   │   ├── Deck.js                # Deck schema
│   │   └── Card.js                # Card schema with SRS fields
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── deckRoutes.js
│   │   ├── cardRoutes.js
│   │   └── reviewRoutes.js
│   ├── utils/
│   │   └── generateToken.js       # JWT signing utility
│   ├── server.js                  # Express entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   └── layout/
        │       └── AppLayout.js   # Sidebar + mobile nav
        ├── contexts/
        │   └── AuthContext.js     # Global auth state
        ├── pages/
        │   ├── LandingPage.js
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── DashboardPage.js
        │   ├── DecksPage.js
        │   ├── CreateDeckPage.js  # Also handles edit mode
        │   ├── DeckDetailPage.js
        │   ├── StudyPage.js       # Study mode + SRS UI
        │   ├── PublicDecksPage.js
        │   └── ProfilePage.js
        ├── routes/
        │   └── ProtectedRoute.js
        ├── services/
        │   └── api.js             # Axios instance + all API calls
        ├── utils/
        │   └── theme.js           # MUI theme + design system
        ├── App.js
        └── index.js
```

---

## Installation & Running Locally

### Prerequisites

- Node.js 18+
- npm or yarn
- A MongoDB Atlas account (free tier is fine)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/flip.git
cd flip
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/flip?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev     # development with nodemon
npm start       # production
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable         | Description                              | Required |
|------------------|------------------------------------------|----------|
| `PORT`           | Port the Express server listens on       | No (default: 5000) |
| `MONGODB_URI`    | MongoDB Atlas connection string          | **Yes** |
| `JWT_SECRET`     | Secret key for signing JWTs (min 32 chars) | **Yes** |
| `JWT_EXPIRES_IN` | JWT expiry (e.g., `7d`, `24h`)          | No (default: 7d) |
| `NODE_ENV`       | `development` or `production`            | No |
| `FRONTEND_URL`   | CORS allowed origin                      | **Yes in production** |

### Frontend (`frontend/.env`)

| Variable              | Description                 | Required |
|-----------------------|-----------------------------|----------|
| `REACT_APP_API_URL`   | Base URL for the backend API | **Yes** |

---

## Deployment

### Backend → Render

1. Push your backend code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set root directory to `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables from the table above
7. Copy the deployed URL (e.g., `https://flip-api.onrender.com`)

### Frontend → Vercel

1. Push frontend code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import repo, set root directory to `frontend`
4. Add environment variable:
   - `REACT_APP_API_URL` = `https://flip-api.onrender.com/api`
5. Deploy

### Database → MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write permissions
3. Whitelist `0.0.0.0/0` (allow all IPs) for Render compatibility
4. Copy the connection string into your `MONGODB_URI` env variable

---

## Spaced Repetition System (SRS)

FLIP uses a simplified SRS algorithm. After reviewing a card, users rate their recall:

| Rating | Next review |
|--------|-------------|
| Hard   | +1 day      |
| Good   | +3 days     |
| Easy   | +7 days     |

Cards are sorted by `nextReviewDate`. Study mode shows only cards due today (`nextReviewDate <= now`). New cards are due immediately.

---

## Architecture Decisions

- **Denormalized `cardCount`** on Deck: Avoids expensive `COUNT` aggregations on every deck list render. Updated via `$inc` on card create/delete.
- **`select: false` on password**: Ensures the password hash is never accidentally returned in API responses.
- **Cascade delete**: Deleting a deck removes all its cards atomically via `Card.deleteMany({ deckId })`.
- **Study mode outside AppLayout**: Full-screen focus mode — no sidebar distractions during active study sessions.
- **Single `CreateDeckPage`** for create + edit: Reduces code duplication. Edit mode is detected via `useParams` — if `:id` is present, it's an edit.

---

## License

MIT
