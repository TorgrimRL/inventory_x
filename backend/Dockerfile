FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# For postgres driver (psycopg/psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
  && rm -rf /var/lib/apt/lists/*

# uv
RUN pip install --no-cache-dir uv

# Copy only dependency files first (better caching)
COPY pyproject.toml uv.lock /app/

# Install deps locked
RUN uv sync --frozen

# Copy the rest
COPY . /app

EXPOSE 8000

# Use uv run exactly like README says
CMD ["uv", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
