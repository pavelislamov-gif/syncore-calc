#!/bin/sh
set -e
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUPS_DIR:-/data/backups}"
DOCUMENTS_DIR="${DOCUMENTS_DIR:-/data/documents}"
mkdir -p "$BACKUP_DIR"
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/db_${TIMESTAMP}.sql"
tar -czf "$BACKUP_DIR/documents_${TIMESTAMP}.tar.gz" -C "$(dirname "$DOCUMENTS_DIR")" "$(basename "$DOCUMENTS_DIR")" 2>/dev/null || true
echo "Backup saved to $BACKUP_DIR"
