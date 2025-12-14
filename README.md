# Job Application Bot

Ein vollautomatisches Bewerbungssystem, das ATS-Systeme umgeht, alle 4 Stunden nach relevanten Jobs sucht, automatisch Bewerbungen versendet und vollständige Transparenz über den Bewerbungsprozess bietet.

## Features

### Automatische Jobsuche
- **Multi-Platform-Scraping**: Durchsucht Indeed, StepStone und weitere Job-Portale
- **Intelligente Filterung**: Branchen-, Standort- und Keyword-basierte Suche
- **Relevanz-Scoring**: Automatische Bewertung der Job-Relevanz basierend auf Ihrem Profil
- **Duplikaterkennung**: Verhindert mehrfache Bewerbungen auf dieselbe Stelle

### ATS-Optimierung
- **ATS-Erkennung**: Identifiziert automatisch verwendete ATS-Systeme
- **Keyword-Optimierung**: Passt CVs und Anschreiben an ATS-Anforderungen an
- **Best-Practice-Formulare**: Intelligentes Ausfüllen von Bewerbungsformularen

### LLM-Integration
- **Individualisierte Anschreiben**: Automatische Generierung personalisierter Cover Letters
- **Job-Matching**: Analyse der Stellenbeschreibung und Abgleich mit Ihrem Profil
- **Qualitätssicherung**: Bewertung der Bewerbungsqualität vor dem Versand

### Automatisierung
- **4-Stunden-Scheduler**: Automatische Jobsuche alle 4 Stunden
- **Tägliche Updates**: Zusammenfassung der Aktivitäten jeden Abend um 20:00 Uhr
- **Retry-Logik**: Automatische Wiederholung bei fehlgeschlagenen Bewerbungen
- **Benachrichtigungen**: Echtzeit-Updates über neue Stellen und Bewerbungsstatus

### Dashboard & Verwaltung
- **Übersichtsdashboard**: Statistiken zu Jobs, Bewerbungen und Erfolgsquoten
- **Job-Verwaltung**: Filtern, Durchsuchen und Bewerben auf gefundene Stellen
- **Bewerbungstracking**: Vollständiger Überblick über alle eingereichten Bewerbungen
- **CV-Management**: Upload und Verwaltung mehrerer Lebensläufe
- **Suchkonfiguration**: Flexible Einrichtung von Suchkriterien

## Technologie-Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Node.js, Express, tRPC 11
- **Database**: MySQL/TiDB mit Drizzle ORM
- **Storage**: S3-kompatibler Cloud-Storage
- **Scheduler**: node-cron für zeitgesteuerte Aufgaben
- **Scraping**: Puppeteer, Cheerio
- **LLM**: Manus Built-in LLM API

## Installation

### Voraussetzungen
- Node.js 22.x oder höher
- pnpm 10.x oder höher
- MySQL/TiDB Datenbank
- S3-kompatibler Storage (wird automatisch bereitgestellt)

### Lokale Installation

1. **Repository klonen**
```bash
git clone <repository-url>
cd job_application_bot
```

2. **Dependencies installieren**
```bash
pnpm install
```

3. **Datenbank einrichten**
```bash
pnpm db:push
```

4. **Development Server starten**
```bash
pnpm dev
```

Der Server läuft nun auf `http://localhost:3000`

### Cloud-Deployment

Das Projekt ist für Manus-Hosting optimiert und kann mit einem Klick deployed werden:

1. Checkpoint erstellen (über die UI oder CLI)
2. Auf "Publish" klicken im Management-UI
3. Optional: Custom Domain konfigurieren

## Konfiguration

### Erste Schritte

1. **CV hochladen**
   - Navigieren Sie zu "CVs"
   - Laden Sie Ihren Lebenslauf hoch (PDF, DOC, DOCX)
   - Markieren Sie einen CV als Standard

2. **Suchkonfiguration erstellen**
   - Navigieren Sie zu "Konfiguration"
   - Erstellen Sie eine neue Suchkonfiguration
   - Definieren Sie:
     - Suchbegriffe (z.B. "Software Developer, Full Stack")
     - Standorte (z.B. "Berlin, München, Remote")
     - Branchen (z.B. "IT, Software, Technology")
     - Plattformen (indeed, stepstone)

3. **Scheduler aktivieren**
   - Der Scheduler startet automatisch beim Server-Start
   - Läuft alle 4 Stunden (0, 4, 8, 12, 16, 20 Uhr)
   - Tägliche Zusammenfassung um 20:00 Uhr

### Manuelle Jobsuche

Sie können jederzeit eine manuelle Jobsuche auslösen:
- Dashboard → "Manuell starten" Button im Scheduler-Status-Bereich

## Verwendung

### Automatischer Modus

Das System arbeitet vollautomatisch:

1. **Jobsuche**: Alle 4 Stunden werden neue Stellen gesucht
2. **Relevanz-Bewertung**: Jobs werden automatisch bewertet (0-100%)
3. **Automatische Bewerbung**: Stellen mit ≥60% Relevanz werden automatisch beworben
4. **Benachrichtigungen**: Sie erhalten Updates über neue Bewerbungen

### Manueller Modus

Sie können auch manuell eingreifen:

1. **Jobs durchsuchen**: Navigieren Sie zu "Stellen"
2. **Filtern**: Nutzen Sie die Filter nach Status und Plattform
3. **Bewerben**: Klicken Sie auf "Bewerben" bei interessanten Stellen
4. **Ignorieren**: Markieren Sie uninteressante Stellen als "Ignoriert"

### Bewerbungsstatus

Verfolgen Sie Ihre Bewerbungen unter "Bewerbungen":
- **Ausstehend**: Bewerbung wird vorbereitet
- **Eingereicht**: Erfolgreich versendet
- **In Prüfung**: Vom Arbeitgeber gesehen
- **Interview geplant**: Einladung zum Gespräch
- **Angenommen**: Jobangebot erhalten
- **Abgelehnt**: Absage erhalten

## Architektur

### Backend-Services

- **jobScraper.ts**: Multi-Platform Job-Scraping mit Puppeteer
- **documentManager.ts**: CV- und Cover-Letter-Management mit S3
- **llmService.ts**: LLM-Integration für Anschreiben und ATS-Optimierung
- **applicationAutomation.ts**: Automatisches Ausfüllen und Versenden
- **scheduler.ts**: Zeitgesteuerte Jobsuche und Updates

### Database Schema

- **users**: Benutzer und Authentifizierung
- **cv_documents**: CV-Metadaten und S3-Referenzen
- **cover_letter_templates**: Anschreiben-Vorlagen
- **search_configurations**: Suchkriterien-Konfigurationen
- **job_postings**: Gefundene Stellenangebote
- **applications**: Bewerbungsstatus und -verlauf
- **application_logs**: Detaillierte Logs pro Bewerbung
- **scheduler_runs**: Scheduler-Ausführungshistorie

### API-Routen (tRPC)

- **auth**: Authentifizierung und Session-Management
- **cv**: CV-Upload, -Verwaltung und -Löschung
- **coverLetter**: Anschreiben-Vorlagen verwalten
- **searchConfig**: Suchkonfigurationen erstellen und bearbeiten
- **jobs**: Stellenangebote durchsuchen und Status aktualisieren
- **applications**: Bewerbungen verwalten und tracken
- **scheduler**: Scheduler-Status und manuelle Auslösung
- **dashboard**: Übersichts-Statistiken

## Sicherheit & Datenschutz

- **Authentifizierung**: Manus OAuth für sichere Anmeldung
- **Datenverschlüsselung**: Alle Daten werden verschlüsselt übertragen
- **S3-Storage**: Sichere Speicherung von CVs und Dokumenten
- **Session-Management**: JWT-basierte Sessions mit HttpOnly Cookies
- **Input-Validierung**: Zod-Schema-Validierung für alle Eingaben

## Einschränkungen & Hinweise

### Web-Scraping
- Job-Portale können Anti-Bot-Maßnahmen implementieren
- Cloudflare und ähnliche Dienste können Scraping blockieren
- Rate-Limiting kann die Anzahl der Anfragen begrenzen

### ATS-Systeme
- Nicht alle ATS-Systeme können automatisch umgangen werden
- Einige Portale erfordern manuelle Captcha-Lösung
- Best-Practice-Strategien erhöhen die Erfolgsquote

### Rechtliche Aspekte
- Beachten Sie die Nutzungsbedingungen der Job-Portale
- Automatisierte Bewerbungen können gegen ToS verstoßen
- Verwenden Sie das System verantwortungsvoll

## Troubleshooting

### Scheduler läuft nicht
```bash
# Server-Logs prüfen
cd /home/ubuntu/job_application_bot
pnpm dev
# Suchen Sie nach "[Scheduler] Initialized" in den Logs
```

### Keine Jobs gefunden
- Prüfen Sie Ihre Suchkonfiguration
- Erweitern Sie die Suchbegriffe
- Fügen Sie weitere Standorte hinzu
- Aktivieren Sie mehr Plattformen

### Bewerbungen schlagen fehl
- Prüfen Sie die Application Logs
- Stellen Sie sicher, dass ein CV hochgeladen ist
- Überprüfen Sie die Internetverbindung
- Manueller Retry über die UI

### Tests ausführen
```bash
pnpm test
```

## Entwicklung

### Projekt-Struktur
```
job_application_bot/
├── client/                 # Frontend React App
│   ├── src/
│   │   ├── pages/         # Page-Komponenten
│   │   ├── components/    # Wiederverwendbare UI-Komponenten
│   │   └── lib/           # tRPC Client
├── server/                # Backend Express + tRPC
│   ├── services/          # Business Logic
│   ├── routers.ts         # tRPC Router
│   └── db.ts              # Database Queries
├── drizzle/               # Database Schema
└── shared/                # Geteilte Types & Constants
```

### Tests hinzufügen
```bash
# Neue Test-Datei erstellen
touch server/services/myService.test.ts

# Tests ausführen
pnpm test

# Tests im Watch-Mode
pnpm test --watch
```

### Neue Features hinzufügen
1. Schema in `drizzle/schema.ts` erweitern
2. DB-Queries in `server/db.ts` hinzufügen
3. Service-Logik in `server/services/` implementieren
4. tRPC-Router in `server/routers.ts` erweitern
5. Frontend-Komponenten in `client/src/pages/` erstellen
6. Tests schreiben und ausführen

## Support

Bei Fragen oder Problemen:
- GitHub Issues: <repository-url>/issues
- Manus Support: https://help.manus.im

## Lizenz

MIT License - siehe LICENSE Datei für Details

## Danksagungen

Inspiriert durch die Reddit-Community r/Germany_Jobs und die Herausforderungen moderner Jobsuche mit ATS-Systemen.
