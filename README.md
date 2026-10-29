# WorkFlowHub

A small full-stack workflow tracker for the SOFT806 CI/CD assignment (AIS, Trimester 3, 2026).
Users register, log in, and manage workflow items on a three-column board (Pending, In Progress, Completed): create, edit, set a priority and due date, move between columns and delete. Every action shows an alert message, and deleting or logging out asks for confirmation.

| Part | Technology | Folder |
|---|---|---|
| Backend API | Django 5 + Django REST Framework (token authentication) | `backend/` |
| Frontend | React 18 + Vite | `frontend/` |
| Containers | Docker, Docker Compose | `Dockerfile` in each folder, `docker-compose.yml` |
| CI | GitHub Actions and CircleCI | `.github/workflows/ci.yml`, `.circleci/config.yml` |

## Run everything with Docker (recommended)

```bash
cp .env.example .env        # Windows: copy .env.example .env  (then set DJANGO_SECRET_KEY)
docker compose up --build
```

- Frontend: http://localhost:3000
- API health check: http://localhost:8000/api/health/

## Run without Docker

Backend (Python 3.12):

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate      # Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
set DJANGO_DEBUG=True                                # Mac/Linux: export DJANGO_DEBUG=True
python manage.py migrate
python manage.py runserver                           # http://localhost:8000
python manage.py test                                # run the backend tests
```

Frontend (Node 20+):

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                                          # http://localhost:5173
npm test
```

## API summary

| Method | URL | Purpose |
|---|---|---|
| POST | `/api/auth/register/` | Create an account, returns a token |
| POST | `/api/auth/login/` | Log in, returns a token |
| POST | `/api/auth/logout/` | Log out (token is deleted) |
| GET | `/api/auth/me/` | Current user |
| GET, POST | `/api/items/` | List (optional `?status=`) or create items (fields: title, description, status, priority, due_date) |
| GET, PUT, PATCH, DELETE | `/api/items/<id>/` | Retrieve, update or delete an item |
| GET | `/api/health/` | Health check used by Docker and CI |

Send the token as `Authorization: Token <token>`.

## Configuration (environment variables)

| Variable | Used by | Purpose |
|---|---|---|
| `DJANGO_SECRET_KEY` | backend | Django secret key (never commit the real one) |
| `DJANGO_DEBUG` | backend | `True` for local development |
| `DJANGO_ALLOWED_HOSTS` | backend | Comma-separated host names |
| `CORS_ALLOWED_ORIGINS` | backend | Origins allowed to call the API |
| `DATABASE_PATH` | backend | SQLite file location (Docker uses a volume) |
| `VITE_API_URL` | frontend | API address, read when the frontend is built |

## Continuous integration

Both pipelines run on push and pull request. They install dependencies (`pip`, `npm`), run the tests, build the
production bundle and build the backend and frontend Docker images. The GitHub Actions workflow also starts the
backend container and calls `/api/health/`.

Secrets are never stored in the repository: use GitHub *Settings > Secrets and variables > Actions* and
CircleCI *Project Settings > Environment Variables*.

## Project workflow

Work is planned in `docs/backlog.json` (18 prioritised user stories), tracked on a GitHub Projects Kanban board
(Backlog, To Do, In Progress, In Review, Done), developed on feature branches and merged into `main` by reviewed pull
requests. `node scripts/create-issues.mjs` creates one GitHub issue per backlog story.
