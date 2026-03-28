# Deployment Guide

Dieses Dokument beschreibt, wie Sie den Job Application Bot auf verschiedenen Plattformen deployen können.

## Inhaltsverzeichnis

1. [Lokales Deployment](#lokales-deployment)
2. [Cloud Deployment](#cloud-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Umgebungsvariablen](#umgebungsvariablen)
5. [Datenbank-Setup](#datenbank-setup)
6. [Troubleshooting](#troubleshooting)

## Lokales Deployment

### Voraussetzungen

- Node.js 22.x oder höher
- pnpm 10.x oder höher
- MySQL/TiDB Datenbank
- S3-kompatibler Storage (optional, für CV-Uploads)

### Installation

1. **Repository klonen**
```bash
git clone https://github.com/your-username/job_application_bot.git
cd job_application_bot
```

2. **Dependencies installieren**
```bash
pnpm install
```

3. **Umgebungsvariablen konfigurieren**

Erstellen Sie eine `.env` Datei im Projekt-Root:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/job_application_bot

# Authentication (Manus OAuth - optional für lokales Testing)
JWT_SECRET=your-random-secret-key-here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth
VITE_APP_ID=your-app-id

# Owner Information
OWNER_OPEN_ID=your-open-id
OWNER_NAME=Your Name

# LLM API (Manus Built-in oder OpenAI)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key

# S3 Storage (optional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=eu-central-1
AWS_S3_BUCKET=your-bucket-name

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

4. **Datenbank initialisieren**
```bash
pnpm db:push
```

5. **Development Server starten**
```bash
pnpm dev
```

Der Server läuft nun auf `http://localhost:3000`

6. **Production Build**
```bash
pnpm build
pnpm start
```

## Cloud Deployment

### Manus Hosting (Empfohlen)

Das Projekt ist für Manus-Hosting optimiert:

1. Erstellen Sie einen Checkpoint über die UI
2. Klicken Sie auf "Publish" im Management-UI
3. Optional: Konfigurieren Sie eine Custom Domain

**Vorteile:**
- Automatisches SSL
- Built-in Datenbank
- Built-in S3-Storage
- Built-in LLM-API
- Keine zusätzliche Konfiguration nötig

### Railway

1. **Railway CLI installieren**
```bash
npm install -g @railway/cli
railway login
```

2. **Projekt erstellen**
```bash
railway init
```

3. **Datenbank hinzufügen**
```bash
railway add mysql
```

4. **Umgebungsvariablen setzen**
```bash
railway variables set DATABASE_URL="mysql://..."
railway variables set JWT_SECRET="..."
# ... weitere Variablen
```

5. **Deployen**
```bash
railway up
```

### Render

1. **Neues Web Service erstellen**
   - Repository verbinden
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`

2. **Datenbank hinzufügen**
   - Neues MySQL Service erstellen
   - Connection String kopieren

3. **Umgebungsvariablen konfigurieren**
   - In Render Dashboard → Environment
   - Alle erforderlichen Variablen hinzufügen

### Vercel (Frontend + Serverless Functions)

️ **Hinweis**: Vercel eignet sich nur bedingt, da der Scheduler kontinuierlich laufen muss.

1. **Vercel CLI installieren**
```bash
npm install -g vercel
```

2. **Deployen**
```bash
vercel
```

3. **Umgebungsvariablen**
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
# ... weitere Variablen
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://root:password@db:3306/job_application_bot
      - JWT_SECRET=your-secret-key
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=job_application_bot
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  db_data:
```

### Docker Befehle

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Stop
docker-compose down
```

## Umgebungsvariablen

### Erforderliche Variablen

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `DATABASE_URL` | MySQL Connection String | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Secret für Session-Cookies | `random-32-char-string` |
| `OWNER_OPEN_ID` | OpenID des Projekt-Owners | `user-123` |

### Optionale Variablen

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `OAUTH_SERVER_URL` | OAuth Server URL | `https://api.manus.im` |
| `BUILT_IN_FORGE_API_URL` | LLM API URL | `https://forge.manus.im` |
| `BUILT_IN_FORGE_API_KEY` | LLM API Key | - |
| `AWS_ACCESS_KEY_ID` | S3 Access Key | - |
| `AWS_SECRET_ACCESS_KEY` | S3 Secret Key | - |
| `AWS_S3_BUCKET` | S3 Bucket Name | - |

## Datenbank-Setup

### MySQL/TiDB

1. **Datenbank erstellen**
```sql
CREATE DATABASE job_application_bot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Benutzer erstellen**
```sql
CREATE USER 'jobbot'@'%' IDENTIFIED BY 'secure-password';
GRANT ALL PRIVILEGES ON job_application_bot.* TO 'jobbot'@'%';
FLUSH PRIVILEGES;
```

3. **Migrations ausführen**
```bash
pnpm db:push
```

### Connection String Format

```
mysql://username:password@host:port/database?ssl={"rejectUnauthorized":true}
```

## Scheduler-Konfiguration

Der Scheduler läuft automatisch beim Server-Start. Konfiguration:

- **4-Stunden-Jobsuche**: Läuft um 0, 4, 8, 12, 16, 20 Uhr
- **Tägliche Zusammenfassung**: Läuft um 20:00 Uhr

### Scheduler deaktivieren

Falls Sie den Scheduler deaktivieren möchten (z.B. für Testing):

```typescript
// server/initScheduler.ts
export function initScheduler() {
  // Kommentieren Sie die Zeile aus:
  // startScheduler();
}
```

## Monitoring & Logs

### Logs anzeigen

**Lokales Deployment:**
```bash
# Development
pnpm dev

# Production
pm2 logs
```

**Docker:**
```bash
docker-compose logs -f app
```

**Railway:**
```bash
railway logs
```

### Health Check

Endpoint: `GET /api/health`

Antwort:
```json
{
  "status": "ok",
  "timestamp": "2025-12-14T12:00:00.000Z",
  "database": "connected",
  "scheduler": "running"
}
```

## Troubleshooting

### Problem: "Owner user not found"

**Lösung**: Loggen Sie sich mindestens einmal in die Anwendung ein, damit der Owner-User in der Datenbank erstellt wird.

### Problem: Scheduler läuft nicht

**Prüfen:**
1. Server-Logs auf Fehler überprüfen
2. Datenbank-Verbindung testen
3. `OWNER_OPEN_ID` korrekt gesetzt?

```bash
# Scheduler-Status prüfen
curl http://localhost:3000/api/trpc/scheduler.status
```

### Problem: Jobs werden nicht gefunden

**Mögliche Ursachen:**
1. Keine aktive Suchkonfiguration vorhanden
2. Job-Portale blockieren Scraping (Cloudflare, Rate-Limiting)
3. Suchkriterien zu spezifisch

**Lösung:**
1. Suchkonfiguration über UI erstellen
2. Proxy/VPN verwenden
3. Suchbegriffe erweitern

### Problem: Bewerbungen schlagen fehl

**Prüfen:**
1. CV hochgeladen und als Standard markiert?
2. Cover Letter Template vorhanden?
3. Application Logs überprüfen:

```sql
SELECT * FROM application_logs ORDER BY created_at DESC LIMIT 10;
```

### Problem: Database Connection Error

**Prüfen:**
1. `DATABASE_URL` korrekt formatiert?
2. Datenbank erreichbar?
3. SSL-Zertifikat gültig?

```bash
# Verbindung testen
mysql -h host -u user -p database
```

### Problem: S3 Upload Error

**Prüfen:**
1. AWS Credentials korrekt?
2. Bucket existiert?
3. Bucket Permissions korrekt?

```bash
# AWS CLI testen
aws s3 ls s3://your-bucket-name
```

## Performance-Optimierung

### Datenbank

1. **Indizes hinzufügen**
```sql
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
```

2. **Query-Caching aktivieren**
```sql
SET GLOBAL query_cache_size = 1000000;
SET GLOBAL query_cache_type = ON;
```

### Scraping

1. **Rate-Limiting anpassen**
```typescript
// server/services/jobScraper.ts
const DELAY_BETWEEN_REQUESTS = 2000; // ms
```

2. **Concurrent Requests limitieren**
```typescript
const MAX_CONCURRENT_SCRAPERS = 3;
```

## Sicherheit

### Best Practices

1. **Secrets nie committen**
   - `.env` in `.gitignore`
   - Secrets über Environment Variables

2. **HTTPS verwenden**
   - SSL-Zertifikat (Let's Encrypt)
   - `secure: true` für Cookies

3. **Rate-Limiting**
```typescript
// server/_core/index.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

4. **Input Validation**
   - Zod-Schemas für alle Inputs
   - SQL Injection Prevention (Drizzle ORM)

## Backup & Recovery

### Datenbank-Backup

```bash
# Backup erstellen
mysqldump -h host -u user -p job_application_bot > backup.sql

# Backup wiederherstellen
mysql -h host -u user -p job_application_bot < backup.sql
```

### Automatisches Backup (Cron)

```bash
# Crontab bearbeiten
crontab -e

# Tägliches Backup um 3 Uhr
0 3 * * * mysqldump -h host -u user -pPASSWORD job_application_bot > /backups/db_$(date +\%Y\%m\%d).sql
```

## Support

Bei Fragen oder Problemen:

- GitHub Issues: https://github.com/your-username/job_application_bot/issues
- Manus Support: https://help.manus.im
- Dokumentation: README.md

## Lizenz

MIT License - siehe LICENSE Datei für Details
