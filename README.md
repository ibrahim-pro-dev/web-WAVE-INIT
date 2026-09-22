# 💪 FitGym

A full-stack gym website with a clean frontend/backend separation. Members can browse plans, register, view their dashboard, and get an AI-generated weekly workout plan.

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js + Express |
| Frontend | Vanilla HTML/CSS/JS (single-page app) |
| Database | SQLite (`better-sqlite3`) |
| AI Workout | Server-side AI API call with local fallback |

## Quick Start

```bash
npm install
npm run seed      # seeds facilities, trainers, memberships + demo member
npm start         # http://localhost:3000
```

> Server needs Node.js 22.9+ (uses `--env-file-if-exists`).

### Demo login / lookup
Open the **Dashboard** and enter member ID `1` to view the seeded demo member.

## Project Structure

```
├── app.js                 # Express server: static SPA + /api + error handling
├── db.js                  # SQLite schema + connection
├── seed.js                # Seeds facilities, trainers, memberships, demo member
├── ai.js                  # Server-side AI client (timeout, validation, fallback)
├── workout-planner.js     # Local workout templates (fallback when no AI key)
├── plans.js               # Static plan definitions
├── routes/
│   └── api.js             # JSON API endpoints
└── public/                # Frontend SPA
    ├── index.html         # App shell
    ├── css/style.css      # Theme
    └── js/main.js         # Router + views (calls /api via fetch)
```

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/members` | Create a member (name, email, phone, membershipPlan) |
| `GET` | `/api/members/:id` | Fetch a member |
| `POST` | `/api/memberships` | Create a membership (name, price, features) |
| `GET` | `/api/memberships` | List memberships |
| `POST` | `/api/workout-assistant` | Generate a weekly plan (goal, level, days) |

Responses are JSON. Validation errors return `400`, duplicates `409`, missing members `404`.

## AI Workout Assistant

The API key is read from environment variables on the server only — it is **never exposed to the frontend**.

```bash
cp .env.example .env
# set AI_API_KEY to enable real AI generation
```

Without `AI_API_KEY`, or if the AI call fails/times out, the assistant transparently falls back to built-in coach templates. The `source` field in the response tells you which path was used (`ai` or `local`).

| Variable | Default | Purpose |
|---|---|---|
| `AI_API_KEY` | — | Enables AI generation |
| `AI_BASE_URL` | `https://api.openai.com/v1` | OpenAI-compatible endpoint |
| `AI_MODEL` | `gpt-4o-mini` | Model name |

## Database Schema

- **members** — id, name, email, phone, password, membership_plan, status, start_date, expiry_date
- **memberships** — id, name, price, features (JSON array)
- **facilities** — id, name, description, icon
- **trainers** — id, name, specialty, photo