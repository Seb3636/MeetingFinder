const API_BASE = "https://meetingfinder.de/api";

console.log("WS BASE =", import.meta.env.VITE_WS_BASE);

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
  const ws = new WebSocket(VITE_WS_BASE);

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
