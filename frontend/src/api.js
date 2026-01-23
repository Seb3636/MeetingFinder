const API_BASE = "http://localhost:3000/api";

/* =====================================================
   EVENT
   ===================================================== */
export async function createEvent(payload) {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("Event creation failed");
  }

  return res.json();
}

export async function getEvent(id) {
  const res = await fetch(`${API_BASE}/events/${id}`);

  if (!res.ok) {
    throw new Error("Event not found");
  }

  return res.json();
}

/* =====================================================
   AVAILABILITY
   ===================================================== */
export async function saveAvailability(id, name, timeslots) {
  const res = await fetch(`${API_BASE}/events/${id}/availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, timeslots })
  });

  if (!res.ok) {
    throw new Error("Saving availability failed");
  }

  return res.json();
}

export async function getAggregate(id) {
  const res = await fetch(`${API_BASE}/events/${id}/aggregate`);
  return res.json();
}

/* =====================================================
   LIVE UPDATES (WebSocket)
   ===================================================== */
export function connectLiveUpdates(eventId, onUpdate) {
  const ws = new WebSocket(`ws://localhost:3000`);

  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (
        msg.type === "availability-updated" &&
        msg.eventId === eventId
      ) {
        onUpdate();
      }
    } catch {
      /* ignore */
    }
  };

  return () => ws.close();
}
