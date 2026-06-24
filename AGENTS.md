# Legal SaaS — AGENTS.md

## Repository structure
4 standalone packages (no monorepo tool):
- `backend/` — Python FastAPI + SQLAlchemy async + Celery
- `frontend/` — React 18 + TypeScript + Vite 5 + Tailwind CSS
- `mobile-android/` — Kotlin + Jetpack Compose + Hilt
- `mobile-ios/` — Swift + SwiftUI (iOS 17+)

API versioned under `/api/v1`. No shared package, no codegen, no CI/CD.

## Commands

| Package | Command | Notes |
|---------|---------|-------|
| **frontend** | `npm run dev` | Vite on `:3000`, proxies `/api` → `localhost:8000` |
| | `npm run build` | `tsc && vite build`, output → `dist/` |
| | `npm run lint` | ESLint on `.ts,.tsx`, `--max-warnings 0` |
| | `npm run preview` | Serve production build locally |
| **backend** | `uvicorn app.main:app --reload` | Dev server on `:8000` |
| | `docker compose up` | Full stack (api + celery-worker + celery-beat + postgres + redis) |
| | `alembic upgrade head` | Apply migrations (no migration scripts exist yet) |
| | `alembic revision --autogenerate -m "msg"` | Generate migration |
| **android** | `gradle wrapper` (first) | No wrapper checked in |
| | `./gradlew assembleDebug` | Build debug APK |
| | `./gradlew testDebugUnitTest` | Run unit tests |
| **ios** | `xcodebuild -project LegalSaaS.xcodeproj -scheme LegalSaaS build` | Build |
| | `swift build` | SPM build |
| | `swift test` | Run tests (test target dir missing — no tests exist) |

**No test infrastructure exists in any package.** No lint/typecheck config files exist (ESLint in `package.json` has no `.eslintrc.*`).

**`npm run build` fails** with 5 TS7053 errors (`CaseCard.tsx`, `CaseTimeline.tsx`, `CaseDetail.tsx`) — pre-existing, not caused by agent changes.

## Roles & permissions

Three roles seeded on startup: `admin`, `abogado`, `cliente`. Role-based access:
- **Read endpoints** (`GET /cases`, `/deadlines`, `/actions`): `admin`, `abogado`, `cliente`
- **Write endpoints** (`POST/PUT/DELETE` cases, deadlines, actions): `admin` only, or `admin` + `abogado`
- **AI endpoints**: `admin`, `abogado`
- **Client-specific filtering**: `cliente` users only see cases where `client_email` matches their login email.

## Spanish language

The entire app is 100% in Spanish (UI, API error messages, schemas, backend responses). All labels, buttons, placeholders, and toast messages are translated.

## Architecture & entrypoints

- **Backend:** `app/main.py` — ASGI entrypoint. Lifespan handler calls `Base.metadata.create_all` + seeds roles/holidays on every startup. Routers in `app/api/v1/`, services in `app/services/`, models in `app/models/`.
- **Frontend:** `src/index.tsx` → `App.tsx` (BrowserRouter, AuthProvider, ThemeProvider) → `AppRouter.tsx` (protected routes with DashboardLayout).
- **Android:** Single-Activity Compose app. `MainActivity.kt` → `AppNavigation.kt` (NavHost, start = login). Hilt DI. No local DB (API-driven via Retrofit).
- **iOS:** SwiftUI `@main` in `LegalSaaSApp.swift` → `ContentView.swift` → `AppTabView.swift`. MVVM with singleton Services (`Service.shared`). No DI container. Tokens stored in UserDefaults (no Keychain).

## Key quirks

- **DB schema is NOT migration-driven in dev.** `Base.metadata.create_all` runs on every startup. Alembic is configured (async) but `versions/` is empty — no migration scripts exist.
- **Dev uses SQLite** (`sqlite+aiosqlite:///./legal_saas.db`), production uses PostgreSQL. Pool settings are skipped for SQLite in `database.py`.
- **Mobile API URLs are hardcoded:** Android `util/Constants.kt` (`https://api.legalsaas.com/`), iOS `Utils/Constants.swift` (`https://api.legalsaas.com/v1`). No staging/localhost switching.
- **Android has no Gradle wrapper** checked in — must run `gradle wrapper` first.
- **iOS SPM** has zero third-party dependencies. All networking via URLSession async/await.
- **Celery tasks** use `asyncio.run()` internally (each task spawns its own event loop).
- **Frontend `AuthContext.tsx`** uses `export default` on a non-component, breaking Vite Fast Refresh (triggers full reload on edit).
- **No `.gitignore`** in any package. Build artifacts (`legal_saas.db`, `backend.log`, `frontend.log`, `dist/`) are committed.
- **No CI/CD configs** anywhere in the repo.

## External services (backend)

| Service | Env var | Purpose |
|---------|---------|---------|
| OpenRouter | `OPENROUTER_API_KEY` | AI chat (GPT-4o) |
| Twilio | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER` | WhatsApp notifications |
| SendGrid | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME` | Email notifications |
| AWS S3 | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`, `AWS_REGION` | File storage (configured but not used in app code) |

Backend `.env` provides dev defaults for all (fake/placeholder values). The app runs without real credentials.
