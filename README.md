# NotePilot - Interactive OneNote Learning Assistant

NotePilot ist ein modernes, interaktives Frontend für ein OneNote Add-on, das Ihre Lernreise transformiert.

## 🚀 Funktionen

- **Lernfortschritt Dashboard**: Verfolgen Sie Ihren Fortschritt mit interaktiven Diagrammen und detaillierten Statistiken
- **Prüfungsvorbereitung**: Organisieren Sie Lernthemen, verwalten Sie Fälligkeitstermine und überwachen Sie Ihren Fortschritt
- **KI-Assistent**: Ein intelligenter Chat-Interface für Fragen und Hilfe bei Ihren Studien
- **Einstellungen**: Personalisieren Sie Ihre Erfahrung mit verschiedenen Optionen und Voreinstellungen
- **Responsive Design**: Funktioniert nahtlos auf allen Geräten

## 🛠️ Technologie-Stack

- **React 18** - UI-Bibliothek
- **TypeScript** - Typsichere Entwicklung
- **Tailwind CSS** - Utility-first CSS Framework
- **Vite** - Blitzschneller Build-Tool
- **Recharts** - Interaktive Diagramme

## 📦 Installation

1. Klone das Repository:
```bash
git clone <repository-url>
cd NotePilot
```

2. Installiere die Abhängigkeiten:
```bash
npm install
```

## 🚀 Schnellstart

### Entwicklungsserver starten:
```bash
npm run dev
```

Der Server startet auf `http://localhost:3000`

### Für die Produktion bauen:
```bash
npm run build
```

### Preview der Production-Build:
```bash
npm run preview
```

## 📁 Projektstruktur

```
NotePilot/
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx           # Navigations-Sidebar
│   │   ├── Dashboard.tsx         # Lernfortschritt Seite
│   │   ├── ExamPreparation.tsx   # Prüfungsvorbereitung Seite
│   │   ├── Settings.tsx          # Einstellungen Seite
│   │   └── ChatAssistant.tsx     # KI-Assistent Chat
│   ├── App.tsx                   # Haupt-App Komponente
│   ├── main.tsx                  # Einstiegspunkt
│   └── index.css                 # Globale Styles
├── index.html                    # HTML Template
├── package.json                  # Abhängigkeiten
├── tsconfig.json                 # TypeScript Konfiguration
├── vite.config.ts               # Vite Konfiguration
└── tailwind.config.js           # Tailwind Konfiguration
```

## 🎨 Komponenten

### Sidebar
- Navigation zwischen verschiedenen Seiten
- Schneller Zugriff auf alle Features
- Responsive Design

### Dashboard
- Lernfortschritt in %
- Durchschnittliche Noten
- Wöchentliche Aktivitätsdiagramme
- Leistung nach Fach
- Aktuelle Aktivitäten

### ExamPreparation
- Themen hinzufügen und verwalten
- Fortschrittsbalken für jedes Thema
- Fälligkeitstermine
- Abschlussrate Übersicht

### Settings
- Benachrichtigungen
- Dark Mode
- Sound-Effekte
- Spracheinstellungen
- E-Mail-Benachrichtigungen

### ChatAssistant
- Echtzeit-Chat mit KI
- Nachrichtenhistorie
- Beispielfragen
- Moderne Chat-UI

## 🤝 Beitragen

Beitragen sind willkommen! Bitte erstelle einen Pull Request mit deinen Änderungen.

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## 👨‍💻 Entwickler

NotePilot - Intelligenter Lernassistent für OneNote
v1.0
