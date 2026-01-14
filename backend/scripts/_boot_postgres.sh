#!/usr/bin/env bash
set -e

if ! command -v uv &>/dev/null; then
  echo "Error: 'uv' is not installed."
  exit 1
fi

if ! command -v pg_ctl &>/dev/null; then
  echo "Error: PostgreSQL tools (pg_ctl) not found."
  echo "Please install PostgreSQL"
  exit 1
fi

# Set variables, default to hardcoded if missing
PG_DIR="${PGDATA:-$PWD/.postgres_data}"
SOCKET_DIR="${PGHOST:-$PWD/.postgres_socket}"
PORT="${PGPORT:-5433}"
DB_NAME="${DATABASE_NAME:-inventory_dev}"
LOG="$PG_DIR/postgres.log"

if [ ! -d "$PG_DIR" ]; then
  echo "Initializing Database..."
  initdb --auth=trust --no-locale --encoding=UTF8 -D "$PG_DIR" >/dev/null 2>&1
fi

if ! pg_ctl status -D "$PG_DIR" >/dev/null 2>&1; then
  echo "Starting PostgreSQL on port $PORT..."
  mkdir -p "$SOCKET_DIR"
  pg_ctl start -D "$PG_DIR" -l "$LOG" -o "-k $SOCKET_DIR -p $PORT" >/dev/null

  until pg_isready -h "$SOCKET_DIR" -p "$PORT" >/dev/null 2>&1; do sleep 0.1; done

  if ! psql -h "$SOCKET_DIR" -p "$PORT" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "Creating '$DB_NAME'..."
    createdb -h "$SOCKET_DIR" -p "$PORT" "$DB_NAME"
    uv run python manage.py migrate >/dev/null
    uv run python manage.py seed_db
  fi
fi
