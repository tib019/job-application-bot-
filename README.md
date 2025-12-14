# 🤖 Job Application Bot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-24%20passing-success)](https://github.com/tibo47-161/job-application-bot)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/tibo47-161/job-application-bot/pulls)

> **Ein vollautomatisches Bewerbungssystem, das ATS-Systeme umgeht, alle 4 Stunden nach relevanten Jobs sucht und automatisch personalisierte Bewerbungen versendet.**

Inspiriert durch die Herausforderungen moderner Jobsuche mit Applicant Tracking Systems (ATS), automatisiert dieser Bot den gesamten Bewerbungsprozess – von der Stellensuche bis zur individualisierten Bewerbung.

---

## 📋 Inhaltsverzeichnis

- [Features](#-features)
- [Demo](#-demo)
- [Technologie-Stack](#-technologie-stack)
- [Installation](#-installation)
- [Konfiguration](#-konfiguration)
- [Verwendung](#-verwendung)
- [Architektur](#-architektur)
- [Deployment](#-deployment)
- [Tests](#-tests)
- [Roadmap](#-roadmap)
- [Beitragen](#-beitragen)
- [Lizenz](#-lizenz)

---

## ✨ Features

### 🔍 **Automatische Jobsuche**
- **Multi-Platform-Scraping**: Durchsucht Indeed, StepStone und weitere Job-Portale
- **Intelligente Filterung**: Branchen-, Standort- und Keyword-basierte Suche
- **Relevanz-Scoring**: Automatische Bewertung der Job-Relevanz (0-100%)
- **Duplikaterkennung**: Verhindert mehrfache Bewerbungen auf dieselbe Stelle

### 🎯 **ATS-Optimierung**
- **ATS-Erkennung**: Identifiziert automatisch verwendete ATS-Systeme
- **Keyword-Optimierung**: Passt CVs und Anschreiben an ATS-Anforderungen an
- **Best-Practice-Formulare**: Intelligentes Ausfüllen von Bewerbungsformularen
- **Erfolgsquote-Tracking**: Misst und optimiert die Bewerbungsqualität

### 🤖 **LLM-Integration**
- **Individualisierte Anschreiben**: Automatische Generierung personalisierter Cover Letters
- **Job-Matching**: Analyse der Stellenbeschreibung und Abgleich mit Ihrem Profil
- **Qualitätssicherung**: Bewertung der Bewerbungsqualität vor dem Versand
- **Kontinuierliche Verbesserung**: Lernt aus erfolgreichen Bewerbungen

### ⏰ **Automatisierung**
- **4-Stunden-Scheduler**: Automatische Jobsuche alle 4 Stunden (0, 4, 8, 12, 16, 20 Uhr)
- **Tägliche Updates**: Zusammenfassung der Aktivitäten jeden Abend um 20:00 Uhr
- **Retry-Logik**: Automatische Wiederholung bei fehlgeschlagenen Bewerbungen
- **Benachrichtigungen**: Echtzeit-Updates über neue Stellen und Bewerbungsstatus

### 📊 **Dashboard & Verwaltung**
- **Übersichtsdashboard**: Statistiken zu Jobs, Bewerbungen und Erfolgsquoten
- **Job-Verwaltung**: Filtern, Durchsuchen und Bewerben auf gefundene Stellen
- **Bewerbungstracking**: Vollständiger Überblick über alle eingereichten Bewerbungen
- **CV-Management**: Upload und Verwaltung mehrerer Lebensläufe
- **Suchkonfiguration**: Flexible Einrichtung von Suchkriterien

---

## 🎬 Demo

### Dashboard
![Dashboard Overview](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### Job-Listings
![Job Listings](https://via.placeholder.com/800x400?text=Job+Listings+Screenshot)

### Bewerbungstracking
![Application Tracking](https://via.placeholder.com/800x400?text=Application+Tracking+Screenshot)

---

## 🛠 Technologie-Stack

### Frontend
- **React 19** - Moderne UI-Bibliothek
- **TypeScript** - Type-Safe Development
- **Tailwind CSS 4** - Utility-First CSS Framework
- **shadcn/ui** - Hochwertige UI-Komponenten
- **Wouter** - Lightweight Routing
- **TanStack Query** - Data Fetching & Caching

### Backend
- **Node.js 22** - JavaScript Runtime
- **Express 4** - Web Framework
- **tRPC 11** - End-to-End Type-Safe APIs
- **Drizzle ORM** - TypeScript ORM
- **MySQL/TiDB** - Relationale Datenbank

### Infrastructure
- **Puppeteer** - Headless Browser für Web Scraping
- **Cheerio** - HTML Parsing
- **node-cron** - Scheduler für zeitgesteuerte Aufgaben
- **S3** - Cloud Storage für CVs und Dokumente
- **LLM API** - AI-gestützte Textgenerierung

### DevOps
- **Docker** - Containerisierung
- **GitHub Actions** - CI/CD Pipeline
- **Vitest** - Unit Testing Framework
- **pnpm** - Fast Package Manager

---

## 📦 Installation

### Voraussetzungen

- **Node.js** 22.x oder höher
- **pnpm** 10.x oder höher
- **MySQL/TiDB** Datenbank
- **S3-kompatibler Storage** (optional, für CV-Uploads)

### Lokale Installation

1. **Repository klonen**
```bash
git clone https://github.com/tibo47-161/job-application-bot.git
cd job-application-bot
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

# Authentication
JWT_SECRET=your-random-secret-key-here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/oauth
VITE_APP_ID=your-app-id

# Owner Information
OWNER_OPEN_ID=your-open-id
OWNER_NAME=Your Name

# LLM API
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key

# S3 Storage (optional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=eu-central-1
AWS_S3_BUCKET=your-bucket-name
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

### Docker Installation

```bash
# Mit Docker Compose
docker-compose up -d

# Datenbank-Migrationen ausführen
docker-compose exec app pnpm db:push

# Logs anzeigen
docker-compose logs -f
```

---

## ⚙️ Konfiguration

### Erste Schritte

1. **CV hochladen**
   - Navigieren Sie zu "CVs"
   - Laden Sie Ihren Lebenslauf hoch (PDF, DOC, DOCX)
   - Markieren Sie einen CV als Standard

2. **Suchkonfiguration erstellen**
   - Navigieren Sie zu "Konfiguration"
   - Erstellen Sie eine neue Suchkonfiguration
   - Definieren Sie:
     - **Suchbegriffe**: z.B. "Software Developer, Full Stack Engineer"
     - **Standorte**: z.B. "Berlin, München, Remote"
     - **Branchen**: z.B. "IT, Software, Technology"
     - **Plattformen**: indeed, stepstone

3. **Scheduler aktivieren**
   - Der Scheduler startet automatisch beim Server-Start
   - Läuft alle 4 Stunden (0, 4, 8, 12, 16, 20 Uhr)
   - Tägliche Zusammenfassung um 20:00 Uhr

### Manuelle Jobsuche

Sie können jederzeit eine manuelle Jobsuche auslösen:
- Dashboard → "Manuell starten" Button im Scheduler-Status-Bereich

---

## 🚀 Verwendung

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

---

## 🏗 Architektur

### System-Übersicht

```
┌─────────────────┐
│   React Frontend│
│   (Dashboard)   │
└────────┬────────┘
         │ tRPC
         ▼
┌─────────────────┐
│  Express Server │
│   (tRPC API)    │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    ▼         ▼          ▼          ▼
┌────────┐ ┌──────┐ ┌────────┐ ┌──────┐
│Database│ │ LLM  │ │   S3   │ │Cron  │
│ MySQL  │ │ API  │ │Storage │ │Jobs  │
└────────┘ └──────┘ └────────┘ └──────┘
```

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

---

## 🌐 Deployment

### Manus Hosting (Empfohlen)

```bash
# Einfachstes Deployment - Ein Klick in der UI
# Automatisches SSL, Datenbank, Storage, LLM-API inklusive
```

### Railway

```bash
# Railway CLI installieren
npm install -g @railway/cli
railway login

# Projekt erstellen und deployen
railway init
railway add mysql
railway up
```

### Docker

```bash
# Production Build
docker-compose -f docker-compose.yml up -d

# Mit custom .env
docker-compose --env-file .env.production up -d
```

### Deployment-Script

```bash
# Interaktives Deployment-Script
./deploy.sh

# Optionen:
# 1) Local (Development)
# 2) Local (Production)
# 3) Docker
# 4) Railway
# 5) Render
# 6) Manus Hosting
```

Detaillierte Deployment-Anleitung: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🧪 Tests

### Tests ausführen

```bash
# Alle Tests
pnpm test

# Tests im Watch-Mode
pnpm test --watch

# Coverage Report
pnpm test --coverage

# TypeScript Type-Check
pnpm check
```

### Test-Coverage

- **24 Tests** - Alle bestanden ✅
- **Job Scraping** - 3 Tests
- **Document Management** - 4 Tests
- **LLM Service** - 5 Tests
- **Scheduler** - 5 Tests
- **tRPC Routers** - 6 Tests
- **Authentication** - 1 Test

---

## 🗺 Roadmap

### Version 1.1 (Q1 2025)
- [ ] LinkedIn Integration
- [ ] Xing Integration
- [ ] Monster Integration
- [ ] Erweiterte ATS-Erkennung (Greenhouse, Lever, Workday)

### Version 1.2 (Q2 2025)
- [ ] Browser-Extension für One-Click-Apply
- [ ] Mobile App (React Native)
- [ ] Interview-Vorbereitung mit AI
- [ ] Gehaltsverhandlungs-Assistent

### Version 2.0 (Q3 2025)
- [ ] Multi-User-Support
- [ ] Team-Collaboration-Features
- [ ] Advanced Analytics Dashboard
- [ ] API für Drittanbieter-Integrationen

---

## 🤝 Beitragen

Beiträge sind willkommen! Bitte beachten Sie:

1. **Fork** das Repository
2. **Branch** erstellen (`git checkout -b feature/AmazingFeature`)
3. **Commit** Ihre Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. **Push** zum Branch (`git push origin feature/AmazingFeature`)
5. **Pull Request** öffnen

### Development Guidelines

- Folgen Sie dem bestehenden Code-Stil
- Schreiben Sie Tests für neue Features
- Aktualisieren Sie die Dokumentation
- Verwenden Sie aussagekräftige Commit-Messages

---

## ⚠️ Rechtliche Hinweise

### Web-Scraping
- Job-Portale können Anti-Bot-Maßnahmen implementieren
- Beachten Sie die Nutzungsbedingungen der Job-Portale
- Verwenden Sie das System verantwortungsvoll

### ATS-Systeme
- Nicht alle ATS-Systeme können automatisch umgangen werden
- Einige Portale erfordern manuelle Captcha-Lösung
- Best-Practice-Strategien erhöhen die Erfolgsquote

### Datenschutz
- Alle Daten werden verschlüsselt gespeichert
- CVs und persönliche Daten bleiben privat
- Keine Weitergabe an Dritte

---

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](LICENSE) Datei für Details.

---

## 🙏 Danksagungen

- Inspiriert durch die [r/Germany_Jobs](https://reddit.com/r/Germany_Jobs) Community
- Dank an alle Open-Source-Projekte, die dieses Projekt möglich machen
- Besonderer Dank an die Manus-Plattform für Hosting und LLM-API

---

## 📞 Support

Bei Fragen oder Problemen:

- **GitHub Issues**: [Issues](https://github.com/tibo47-161/job-application-bot/issues)
- **Discussions**: [Discussions](https://github.com/tibo47-161/job-application-bot/discussions)
- **Email**: [support@example.com](mailto:support@example.com)

---

<div align="center">

**Made with ❤️ by [tibo47-161](https://github.com/tibo47-161)**

⭐ **Star this repo if you find it helpful!** ⭐

</div>
