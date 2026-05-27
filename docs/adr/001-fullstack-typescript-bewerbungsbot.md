# ADR-001: Fullstack TypeScript für den Bewerbungs-Bot

**Status:** Accepted  
**Datum:** 2025

## Kontext
Der Bewerbungsbot automatisiert Stellensuche und Bewerbungen. Frontend und Backend sollen eine einheitliche Codebasis teilen.

## Entscheidung
TypeScript Fullstack mit React Frontend (Vite) und Node.js Backend, geteilte Typen in `shared/`.

## Abgewogene Alternativen
- **Python Backend:** Bessere Playwright-Integration, aber kein gemeinsamer Typ-Layer
- **Next.js:** Guter Fullstack-Ansatz, aber für Bot-Backend weniger geeignet

## Konsequenzen
**Positiv:**
- Geteilte Typen zwischen Frontend und Backend vermeiden Diskrepanzen
- Ein einheitlicher Sprachstack (TypeScript)

**Negativ:**
- Node.js Browser-Automatisierung weniger ausgereift als Python/Playwright
