import express from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";

const router = express.Router();
const DEFAULT_TTL_DAYS = 14;

/* ===== Helper ===== */
const isIsoDateTime = (v) => !isNaN(Date.parse(v));
const isDateOnly = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const isTime = (v) => /^\d{2}:\d{2}$/.test(v);

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

/* ============================================================
   EVENT ERSTELLEN (EXPLIZITE TAGE + ZEITFENSTER)
   ============================================================ */
router.post("/", (req, res) => {
  const {
    title,
    allowedDates,
    timeFrom,
    timeTo,
    ttlDays
  } = req.body;

  if (
    !title ||
    title.length < 3 ||
    title.length > 120 ||
    !Array.isArray(allowedDates) ||
    allowedDates.length === 0 ||
    !allowedDates.every(isDateOnly) ||
    !isTime(timeFrom) ||
    !isTime(timeTo)
  ) {
    return res.status(400).json({ error: "invalid payload" });
  }

  const id = uuidv4();
  const expiresAt = addDays(
    Number.isInteger(ttlDays) && ttlDays > 0 ? ttlDays : DEFAULT_TTL_DAYS
  );

  db.prepare(`
    INSERT INTO events (
      id,
      title,
      created_at,
      expires_at,
      allowed_dates,
      time_from,
      time_to
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    title.trim(),
    new Date().toISOString(),
    expiresAt,
    JSON.stringify(allowedDates),
    timeFrom,
    timeTo
  );

  res.status(201).json({ id, expiresAt });
});

/* ============================================================
   EVENT ABRUFEN
   ============================================================ */
router.get("/:id", (req, res) => {
  const event = db.prepare(
    "SELECT * FROM events WHERE id = ? AND expires_at > ?"
  ).get(req.params.id, new Date().toISOString());

  if (!event) {
    return res.status(404).json({ error: "not found or expired" });
  }

  const slots = db.prepare(
    "SELECT name, timeslot FROM availability WHERE event_id = ?"
  ).all(req.params.id);

  res.json({
    event: {
      ...event,
      allowed_dates: JSON.parse(event.allowed_dates)
    },
    slots
  });
});

/* ============================================================
   AVAILABILITY SPEICHERN
   ============================================================ */
router.post("/:id/availability", (req, res) => {
  const { name, timeslots } = req.body;

  if (
    !name ||
    name.length > 60 ||
    !Array.isArray(timeslots) ||
    timeslots.length === 0 ||
    timeslots.length > 1000 ||
    !timeslots.every(isIsoDateTime)
  ) {
    return res.status(400).json({ error: "invalid payload" });
  }

  const event = db.prepare(
    "SELECT allowed_dates, time_from, time_to FROM events WHERE id = ? AND expires_at > ?"
  ).get(req.params.id, new Date().toISOString());

  if (!event) {
    return res.status(404).json({ error: "event not found or expired" });
  }

  const allowedDates = JSON.parse(event.allowed_dates);
  const [fromH, fromM] = event.time_from.split(":").map(Number);
  const [toH, toM] = event.time_to.split(":").map(Number);

  const isAllowedSlot = (iso) => {
    const d = new Date(iso);
    const dateOnly = d.toISOString().slice(0, 10);

    if (!allowedDates.includes(dateOnly)) return false;

    const minutes = d.getHours() * 60 + d.getMinutes();
    const minFrom = fromH * 60 + fromM;
    const minTo = toH * 60 + toM;

    return minutes >= minFrom && minutes <= minTo;
  };

  if (!timeslots.every(isAllowedSlot)) {
    return res.status(400).json({ error: "timeslot outside allowed range" });
  }

  const stmt = db.prepare(
    "INSERT OR IGNORE INTO availability (event_id, name, timeslot) VALUES (?, ?, ?)"
  );

  const tx = db.transaction(() => {
    for (const slot of timeslots) {
      stmt.run(req.params.id, name.trim(), slot);
    }
  });

  tx();

  res.status(201).json({ status: "saved" });

  /* ===== Live Update ===== */
  req.app.get("broadcast")({
    type: "availability-updated",
    eventId: req.params.id
  });
});

/* ============================================================
   AGGREGATION (MIT NAMEN)
   ============================================================ */
router.get("/:id/aggregate", (req, res) => {
  const eventExists = db.prepare(
    "SELECT 1 FROM events WHERE id = ? AND expires_at > ?"
  ).get(req.params.id, new Date().toISOString());

  if (!eventExists) {
    return res.status(404).json({ error: "event not found or expired" });
  }

  const rows = db.prepare(`
    SELECT
      timeslot,
      COUNT(DISTINCT name) AS count,
      GROUP_CONCAT(DISTINCT name) AS names
    FROM availability
    WHERE event_id = ?
    GROUP BY timeslot
  `).all(req.params.id);

  res.json(
    rows.map(r => ({
      timeslot: r.timeslot,
      count: r.count,
      names: r.names ? r.names.split(",") : []
    }))
  );
});

/* ============================================================
   EVENT LÖSCHEN
   ============================================================ */
router.delete("/:id", (req, res) => {
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM availability WHERE event_id = ?").run(req.params.id);
    const info = db.prepare("DELETE FROM events WHERE id = ?").run(req.params.id);
    return info.changes;
  });

  const deleted = tx();
  if (!deleted) {
    return res.status(404).json({ error: "not found" });
  }

  res.json({ status: "deleted" });
});

export default router;
