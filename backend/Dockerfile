# ---- WorkFlowHub backend (Django REST Framework) ----
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install dependencies first so Docker can cache this layer until requirements.txt changes.
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Collect static files at build time (a throw-away key is used only for this build step).
RUN DJANGO_SECRET_KEY=build-only-key python manage.py collectstatic --noinput

# Run as an unprivileged user.
RUN useradd --create-home appuser && mkdir -p /data && chown appuser /data
USER appuser

ENV DATABASE_PATH=/data/db.sqlite3
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health/')" || exit 1

CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2"]
