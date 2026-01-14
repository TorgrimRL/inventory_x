#!/usr/bin/env bash
dropdb -h $PGHOST -p $PGPORT $DATABASE_NAME --if-exists --force
createdb -h $PGHOST -p $PGPORT $DATABASE_NAME
uv run python manage.py migrate >/dev/null
uv run python manage.py seed_db
