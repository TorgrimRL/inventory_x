FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN set -eux; \
    rm -f /etc/apt/sources.list.d/debian.sources || true; \
    rm -f /etc/apt/sources.list || true; \
    printf "%s\n" \
      "deb https://deb.debian.org/debian bookworm main" \
      "deb https://deb.debian.org/debian bookworm-updates main" \
      "deb https://security.debian.org/debian-security bookworm-security main" \
      > /etc/apt/sources.list.d/99-https.list; \
    printf "%s\n" \
      'Acquire::Retries "5";' \
      'Acquire::By-Hash "yes";' \
      'Acquire::PDiffs "false";' \
      'Acquire::https::No-Cache "true";' \
      'Acquire::http::No-Cache "true";' \
      'Acquire::http::Pipeline-Depth "0";' \
      > /etc/apt/apt.conf.d/99-hardening; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*; \
    apt-get update; \
    apt-get install -y --no-install-recommends build-essential libpq-dev; \
    rm -rf /var/lib/apt/lists/*

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
