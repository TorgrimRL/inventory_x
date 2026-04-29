## Database Backup & Restore

### Current Production Backup Process

- Cron runs `/opt/myapp/backup.sh` daily at 2:00 AM.
- Deploy script runs backup before stopping containers.
- Local dump saves to `/home/inventory/backups/`. 7-day retention.
- Remote dump syncs to Backblaze B2 `s3://inventoryx-backups/`. 90-day retention.

### Restore Process

1. Stop web traffic. Keep DB running.
```bash
cd /opt/myapp
docker compose -f docker-compose.prod.yml stop web spa nginx
```

2. Find target dump file.
Check locally:
```bash
ls -l /home/inventory/backups/
```
If local data fails, fetch from B2:
Replace `[FILE]` with filename and `[BUCKET_ENDPOINT]` (contact maintainters).
```bash
aws s3 ls s3://inventoryx-backups/ --endpoint-url https://[BUCKET_ENDPOINT]/
aws s3 cp s3://inventoryx-backups/[FILE] /home/inventory/backups/ --endpoint-url https://[BUCKET_ENDPOINT]/
```

3. Run restore. Replace `[FILE]` with filename.
```bash
source .env
docker compose -f docker-compose.prod.yml exec -T db pg_restore -U $POSTGRES_USER -d $POSTGRES_DB --clean --if-exists < /home/inventory/backups/[FILE]
```

4. Restart stack.
```bash
docker compose -f docker-compose.prod.yml up -d
```
