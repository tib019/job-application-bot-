# Projektscope — Job Application Bot

## Problem
Stellensuche und Bewerbungen sind zeitaufwändig und repetitiv. Die manuelle Durchsicht vieler Portale und das Ausfüllen ähnlicher Formulare kostet viele Stunden.

## Lösung
Ein automatisierter Bot, der Stellenangebote auf Job-Portalen sucht, filtert und automatisch Bewerbungen einreicht. Dashboard für Übersicht und Konfiguration.

## In Scope
- Automatische Stellensuche auf Portalen (Indeed, LinkedIn, etc.)
- Filter nach Kriterien (Standort, Berufsfeld, Erfahrungslevel)
- Automatisierte Bewerbungs-Einreichung
- Bewerbungs-Tracking (Status, Datum, Unternehmen)
- Web-Dashboard für Konfiguration und Monitoring
- Scheduler für zeitgesteuerte Suche
- Docker-Deployment

## Out of Scope
- KI-generierte Anschreiben (separate Erweiterung)
- Integration in Unternehmens-ATS
- Mobile App

## Technologie-Stack
| Schicht | Technologie |
|---------|-------------|
| Frontend | React, Vite, TypeScript |
| Backend | Node.js, TypeScript |
| ORM | Drizzle |
| Testing | Vitest |
| Containerisierung | Docker |
| Scheduler | node-cron |
