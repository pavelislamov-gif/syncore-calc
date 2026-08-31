#!/bin/sh
set -e
if [ -z "$1" ]; then
  echo "Usage: restore.sh <backup_sql_file>"
  exit 1
fi
psql "$DATABASE_URL" < "$1"
echo "Database restored from $1"
