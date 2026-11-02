
# WorkflowHub Django Backend Startup

Write-Host "Starting WorkflowHub Backend..." -ForegroundColor Green

# Create virtual environment if missing
if (!(Test-Path ".venv")) {
    python -m venv .venv
}

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Set local development environment
$env:DJANGO_DEBUG = "True"
$env:DJANGO_SECRET_KEY = "django-insecure-local-development-key-123456789"

# Run database migrations
python manage.py migrate

# Start Django development server
python manage.py runserver
