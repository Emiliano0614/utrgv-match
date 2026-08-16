# UTRGV Match

A platform connecting UTRGV students with local businesses for project collaboration, built as a swipe-based matching app (Tinder-style) — students and businesses build profiles, swipe on each other, and message once matched.

## Stack

- **Frontend:** React 19, React Router, Vite
- **Backend:** Node.js, Express 5
- **Database:** SQLite (via better-sqlite3)
- **Auth:** bcryptjs for password hashing

## Features

- Student and business profile creation (classification/major for students, project/industry/needs for businesses)
- Swipe-based discovery feed
- Mutual-match detection
- In-app messaging between matched users

## Local Development

**Backend:**

```bash
cd server
npm install
npm start
```

Runs on `http://localhost:3000`. SQLite database is created automatically at `server/.local/auth.db` on first run (path can be overridden with the `AUTH_DB_PATH` env var).

**Frontend:**

```bash
cd app
npm install
npm run dev
```

Runs via Vite's dev server (default `http://localhost:5173`).

## Known limitations / next steps

- Frontend currently calls the backend via a hardcoded `http://localhost:3000` URL in each page (`home.jsx`, `Login.jsx`, `SignUp.jsx`, `StudentProfile.jsx`, `BusinessProfile.jsx`, `Matches.jsx`, `messages.jsx`). This needs to move to an environment variable before a production deploy, so the built frontend can point at a real backend URL instead of localhost.
- SQLite is file-based, which works locally but isn't ideal for most hosted platforms with ephemeral filesystems (a redeploy or restart can wipe the database). A production deploy would need either a persistent disk or a switch to a hosted database like Postgres.
- Not yet containerized or deployed.

## Status

- [x] Full frontend (all core pages: login, signup, profiles, discover/swipe, matches, messages)
- [x] Full backend (auth, profiles, swipes, matches, messaging routes)
- [ ] Dockerized
- [ ] Live deployment
