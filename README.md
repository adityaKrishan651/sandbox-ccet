# SkillBridge

AI-powered volunteer–NGO matching platform (MVP). Connects volunteers to NGOs using structured matching, Gemini AI evaluation, and trust scoring.

## Project structure

```
skillbridge/
├── backend/          # Express API (JWT, Supabase, Gemini)
├── frontend/         # Next.js App Router
├── README.md
└── backend/supabase-schema.sql
```

## Quick start

### 1. Database (Supabase)

1. Create a [Supabase](https://supabase.com) project.
2. In the SQL Editor, run `backend/supabase-schema.sql` to create the tables.
3. Copy the project URL and service role key from Settings → API.

### 2. Backend

```bash
cd skillbridge/backend
cp .env.example .env
# Edit .env with:
#   PORT=8080
#   SUPABASE_URL=https://xxx.supabase.co
#   SUPABASE_SERVICE_ROLE_KEY=eyJ...
#   JWT_SECRET=<random-string>
#   GEMINI_API_KEY=<Google AI API key>

npm install
npm run dev
```

### 3. Frontend

```bash
cd skillbridge/frontend
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8080

npm install
npm run dev
```

Open http://localhost:3000

## Environment variables

| Variable | Where | Description |
|----------|-------|-------------|
| `PORT` | backend | Server port (default: 8080) |
| `SUPABASE_URL` | backend | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | backend | Supabase service role key |
| `JWT_SECRET` | backend | Secret for signing JWTs |
| `GEMINI_API_KEY` | backend | Google AI API key |
| `NEXT_PUBLIC_API_URL` | frontend | Backend base URL (e.g. http://localhost:8080) |

## End-to-end flow

1. User registers (volunteer or NGO).
2. User logs in → JWT stored in `localStorage`.
3. NGO creates a task (title, description, required skills, etc.).
4. Volunteer views tasks on the dashboard.
5. Volunteer clicks **Analyze Match** → backend calls Gemini AI.
6. AI returns structured JSON (skill fit, availability fit, risk level, explanation).
7. Result stored in `ai_matches` table.
8. UI displays score breakdown + AI explanation.
9. NGO can view volunteers ranked by AI score for each task.

## API overview

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Register (name, email, password, role, location) |
| POST | `/auth/login` | — | Login, returns JWT |
| GET | `/profile/me` | all | Current user + volunteer profile/skills |
| PUT | `/profile/volunteer` | volunteer | Update bio, availability |
| PUT | `/profile/skills` | volunteer | Replace skills list |
| GET | `/tasks` | all | List tasks |
| GET | `/tasks/me` | ngo | NGO's own tasks |
| POST | `/tasks` | ngo | Create task |
| POST | `/match/:taskId` | volunteer | Run AI match for task |
| GET | `/match/me/list` | volunteer | List volunteer's matches |
| GET | `/match/task/:taskId` | ngo | Volunteers ranked by AI for task |
