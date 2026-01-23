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
Danach erreichbar unter:

Frontend: http://localhost:5173

Backend: http://localhost:3000

🖥️ Nutzung
Neues Meeting erstellen
Titel vergeben

Mögliche Tage im Kalender auswählen

Zeitfenster festlegen

„Meeting erstellen“ klicken

➡️ Es wird eine zufällige URL erzeugt, z. B.:

/event/8c2a1c3e-4c9a-4f4b-a8a4-3e4d9f6e7b12
Verfügbarkeit eintragen
Name eingeben

Zeitslots anklicken

Speichern

Auswertung
Beste Zeiten werden automatisch hervorgehoben

Hover über Slots zeigt Teilnehmernamen

Änderungen erscheinen live bei allen offenen Browsern

📦 API (Kurzüberblick)
Event erstellen
POST /api/events
Payload:

{
  "title": "Teammeeting",
  "allowedDates": ["2026-01-02", "2026-01-09"],
  "timeFrom": "09:00",
  "timeTo": "17:00"
}
Event abrufen
GET /api/events/:id
Verfügbarkeit speichern
POST /api/events/:id/availability
Aggregation (Auswertung)
GET /api/events/:id/aggregate
🔐 Datenschutz
MeetingFinder speichert ausschließlich:

Meeting-Titel

ausgewählte Tage

Zeitfenster

Namen der Teilnehmer

gewählte Zeitslots

❌ Keine Accounts
❌ Keine Cookies
❌ Kein Tracking
❌ Keine Drittanbieter

Alle Daten liegen lokal in einer SQLite-Datei.

🛠️ Entwicklung
Frontend (Hot Reload)
docker compose up
Backend-Logs
docker compose logs -f backend
🧭 Roadmap (optional)
📆 Monatsnavigation im Kalender

📤 ICS-Export für beste Zeit

👀 Read-only Ansicht

📱 Mobile Optimierungen

🗑️ Automatische Löschung abgelaufener Meetings

📄 Lizenz
MIT License
Freie Nutzung, Änderung und Weiterverbreitung erlaubt.

💡 Motivation
Viele bestehende Terminfindungstools sammeln unnötige Daten oder sind nur eingeschränkt nutzbar.
MeetingFinder setzt bewusst auf Einfachheit, Transparenz und Selbsthosting.

Feedback, Issues und Pull Requests sind willkommen.
