# FLIP API Documentation

Base URL: `https://your-api.onrender.com/api`

All protected routes require the header:
```
Authorization: Bearer <jwt_token>
```

Responses always follow this shape:
```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... }
}
```

---

## Authentication

### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "name": "Alex Kumar",
  "email": "alex@example.com",
  "password": "securepass123"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "_id": "65abc123...",
      "name": "Alex Kumar",
      "email": "alex@example.com",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:** 400 (validation), 409 (email exists)

---

### POST /auth/login

Log in an existing user.

**Request Body:**
```json
{
  "email": "alex@example.com",
  "password": "securepass123"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "user": { "_id": "...", "name": "Alex Kumar", "email": "alex@example.com" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:** 400 (validation), 401 (invalid credentials)

---

### GET /auth/me

Get the currently authenticated user. **Protected.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "Alex Kumar", "email": "alex@example.com" }
  }
}
```

---

## Decks

### GET /decks

Get all decks belonging to the authenticated user. **Protected.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "decks": [
      {
        "_id": "65deck1...",
        "title": "Spanish Vocabulary",
        "description": "Common everyday words",
        "category": "Language",
        "isPublic": false,
        "cardCount": 24,
        "createdAt": "2024-01-10T08:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

---

### GET /decks/public

Get all public decks from all users. **Protected.**

Response shape same as GET /decks. Includes `createdBy: { name }` populated.

---

### GET /decks/:id

Get a single deck by ID. **Protected.** Accessible if owner or deck is public.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "deck": { ... },
    "isOwner": true
  }
}
```

**Errors:** 404 (not found), 403 (private deck, not owner)

---

### POST /decks

Create a new deck. **Protected.**

**Request Body:**
```json
{
  "title": "Calculus Formulas",
  "description": "Key formulas for Calc I & II",
  "category": "Math",
  "isPublic": false
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Deck created.",
  "data": { "deck": { "_id": "...", "title": "Calculus Formulas", ... } }
}
```

---

### PUT /decks/:id

Update a deck. **Protected. Owner only.**

**Request Body:** (any combination of fields)
```json
{
  "title": "Updated Title",
  "isPublic": true
}
```

**Response 200:** Updated deck object.

---

### DELETE /decks/:id

Delete a deck and all its cards. **Protected. Owner only.**

**Response 200:**
```json
{
  "success": true,
  "message": "Deck and its cards deleted successfully."
}
```

---

## Cards

### GET /cards/:deckId

Get all cards in a deck. **Protected.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "_id": "65card1...",
        "deckId": "65deck1...",
        "front": "Photosynthesis",
        "back": "The process by which plants convert light into energy",
        "reviewCount": 3,
        "lastReviewed": "2024-01-14T10:00:00.000Z",
        "nextReviewDate": "2024-01-17T10:00:00.000Z",
        "difficulty": "good"
      }
    ],
    "count": 1
  }
}
```

---

### GET /cards/:deckId/due

Get only cards due for review today (`nextReviewDate <= now`). **Protected.**

Same shape as GET /cards/:deckId. Cards are sorted by `nextReviewDate` ascending (oldest due first).

---

### POST /cards

Create a new card. **Protected. Deck owner only.**

**Request Body:**
```json
{
  "deckId": "65deck1...",
  "front": "What is a closure in JavaScript?",
  "back": "A function that retains access to its outer scope even after the outer function has returned"
}
```

**Response 201:** Created card object.

---

### PUT /cards/:id

Update a card's front or back. **Protected. Deck owner only.**

**Request Body:**
```json
{
  "front": "Updated question",
  "back": "Updated answer"
}
```

**Response 200:** Updated card object.

---

### DELETE /cards/:id

Delete a card. **Protected. Deck owner only.**

**Response 200:**
```json
{ "success": true, "message": "Card deleted." }
```

---

## Reviews (SRS)

### POST /review/:cardId

Submit a review rating for a card. Updates SRS schedule. **Protected.**

**Request Body:**
```json
{
  "rating": "good"
}
```

`rating` must be one of: `"hard"`, `"good"`, `"easy"`

**SRS Intervals:**
- `hard` → nextReviewDate = today + 1 day
- `good` → nextReviewDate = today + 3 days
- `easy` → nextReviewDate = today + 7 days

**Response 200:**
```json
{
  "success": true,
  "message": "Review recorded.",
  "data": {
    "card": { "reviewCount": 4, "lastReviewed": "...", "nextReviewDate": "...", "difficulty": "good" },
    "nextReviewDate": "2024-01-18T10:30:00.000Z",
    "daysUntilNextReview": 3
  }
}
```

---

### GET /review/stats

Get dashboard statistics for the authenticated user. **Protected.**

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalDecks": 5,
    "totalCards": 142,
    "cardsDueToday": 12,
    "recentDecks": [
      { "_id": "...", "title": "Spanish Vocab", "category": "Language", "isPublic": false }
    ]
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

| Status | Meaning                         |
|--------|---------------------------------|
| 400    | Validation error / bad request  |
| 401    | Not authenticated               |
| 403    | Forbidden (not authorized)      |
| 404    | Resource not found              |
| 409    | Conflict (e.g., duplicate email)|
| 500    | Internal server error           |
