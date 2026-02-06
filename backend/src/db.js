import Database from "better-sqlite3";

const db = new Database("meetingfinder.db");

db.exec(`
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,

  allowed_dates TEXT NOT NULL, -- JSON Array: ["2026-01-19","2026-01-21"]
  time_from TEXT NOT NULL,
  time_to TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  name TEXT NOT NULL,
  timeslot TEXT NOT NULL,
  UNIQUE(event_id, name, timeslot)
);
`);

export default db;
