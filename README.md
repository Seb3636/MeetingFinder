# MeetingFinder

**MeetingFinder** ist eine selbstgehostete, datenschutzfreundliche Alternative zu when2meet.  
Ziel ist eine einfache Terminfindung **ohne Accounts, ohne Tracking, ohne externe Dienste**.

Das Projekt eignet sich sowohl für kleine Teams als auch für private Terminabsprachen und kann vollständig lokal oder auf einem eigenen Server betrieben werden.

---

## ✨ Features

### Allgemein
- 🔗 Meetings sind **nur über zufällige URLs** erreichbar
- 🕒 **30-Minuten-Zeitslots**
- 📅 **Explizite Tagesauswahl** (kein Start-/Enddatum)
- 🔒 Keine Benutzerkonten, keine Cookies, kein Tracking
- 🐳 Komplett **Docker-basiert**

### Terminfindung
- Kalenderansicht mit **Wochentagen (Mo–So)**
- Drag-&-Drop Auswahl von Tagen
- Zeitfenster „nicht vor / nicht nach“
- Mehrere Teilnehmer können parallel abstimmen
- Live-Updates per WebSocket

### Auswertung
- ⭐ **Beste Zeit(en)** automatisch berechnet
- Markierung der besten Slots direkt im Grid
- Separate Liste der besten Slots
- Hover zeigt **wer für welchen Slot abgestimmt hat**

---

## 🧱 Architektur

MeetingFinder
├── backend (Node.js + Express + SQLite)
├── frontend (Vue 3 + Vite)
└── docker-compose.yml


### Backend
- Node.js (ESM)
- Express
- SQLite (lokal, dateibasiert)
- REST API + WebSocket (Live-Updates)

### Frontend
- Vue 3 (Composition API)
- Vite
- Keine UI-Frameworks (leichtgewichtig, schnell)
- Responsive Grundstruktur

---

## 🚀 Installation & Start

### Voraussetzungen
- Docker
- Docker Compose

### Starten
```bash
docker compose up --build
