import http from "http";
import app from "./app.js";
import db from "./db.js";
import { WebSocketServer } from "ws";

const port = process.env.PORT || 3000;

/* ===== HTTP Server ===== */
const server = http.createServer(app);

/* ===== WebSocket ===== */
const wss = new WebSocketServer({ server });

function broadcast(message) {
  const data = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(data);
    }
  }
}

/* ===== Expose broadcast ===== */
app.set("broadcast", broadcast);

/* ===== Cleanup ===== */
const cleanupExpired = () => {
  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    db.prepare(
      "DELETE FROM availability WHERE event_id IN (SELECT id FROM events WHERE expires_at <= ?)"
    ).run(now);
    return db.prepare(
      "DELETE FROM events WHERE expires_at <= ?"
    ).run(now).changes;
  });

  const removed = tx();
  if (removed > 0) {
    console.log(`Cleanup: removed ${removed} expired events`);
  }
};

cleanupExpired();

/* ===== Start ===== */
server.listen(port, () => {
  console.log(`MeetingFinder backend listening on port ${port}`);
});
