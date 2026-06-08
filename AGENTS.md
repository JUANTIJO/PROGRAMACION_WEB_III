# AGENTS.md — SaludApp

## Structure
Monorepo with two packages:
- `backend/` — Node.js + Express API (entry: `src/server.js`)
- `frontend/` — Expo React Native app (entry: `App.js` → `src/navigation/AppNavigator.js`)

No workspace manager (no root `package.json`). Run commands from each package directory.

## Backend Setup
Requires PostgreSQL with `uuid-ossp` extension. Schema: `backend/src/database/schema.sql`.

```bash
cd backend
cp .env.example .env  # then edit DB credentials
npm install
npm run migrate       # runs schema.sql
npm run dev           # nodemon
```

Server runs on `PORT=3000` by default. API prefix: `/api`

## Frontend Setup
```bash
cd frontend
npm install
echo "EXPO_PUBLIC_API_URL=http://localhost:3000/api" > .env
npx expo start
```

Uses Expo ~55. Expo CLI must be installed globally or via npx.

## Conventions
- All deletes are logical (`activo = false`) — never physical deletion
- Access logging to `logs_acceso` table is mandatory for all auth events
- JWT auth with bcryptjs cost 12
- Roles: `paciente`, `familiar`, `admin`
- No TypeScript, no linter, no test framework configured

## Notes
- No CI/CD workflows present
- No root `opencode.json` — use this file for agent instructions
- `.env` files excluded from git (security)

## GitHub
- Remote: https://github.com/JUANTIJO/PROGRAMACION_WEB_III.git
- Branch: `main`

## Current IP (Local WiFi)
- PC: `192.168.0.6`
- Frontend `.env`: `EXPO_PUBLIC_API_URL=http://192.168.0.6:3000/api`
- Backend `.env`: `FRONTEND_URL=*`
- If IP changes, update `frontend/.env` and restart Expo

## Bugs Fixed (June 8, 2026)
**Frontend:**
- `LoginScreen.js:72,91` & `RegistroScreen.js:56` — `navigation.replace("Dashboard")` changed to `"Home"` (route name mismatch)

**Backend controllers:**
- Fixed import paths: `require("../../config/database")` → `require("../config/database")`
- `authController.js` — logger path fixed, `rol` forced to `"paciente"`

**Server:**
- Added `trust proxy`, fixed CORS (`credentials` removed with wildcard origin), error handler hides details in production

**Schema:**
- `UNIQUE` on `versiculos.referencia` + `ON CONFLICT DO NOTHING`

## Deploy Guide
Full guide at `doc/guia-deploy-supabase-apk.md` (Supabase + Render + EAS Build)

## Pending
1. Choose universal emojis in EspiritualScreen.js CATEGORIAS array
2. Execute deploy (Supabase + Render + EAS Build)
3. Optional: UptimeRobot to prevent Render free tier sleep
