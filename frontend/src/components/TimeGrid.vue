<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import {
  getEvent,
  saveAvailability,
  getAggregate,
  connectLiveUpdates
} from "../api";

const props = defineProps({
  eventId: {
    type: String,
    required: true
  }
});

const event = ref(null);
const name = ref("");
const times = ref([]);

const selected = ref(new Set());
const aggregate = ref({});

let disconnectWS = null;

/* ===== Zeiten (30 Minuten) ===== */
function buildTimes() {
  times.value = [];

  const timeFrom = event.value.time_from || "09:00";
  const timeTo = event.value.time_to || "17:00";

  const [fh, fm] = timeFrom.split(":").map(Number);
  const [th, tm] = timeTo.split(":").map(Number);

  let t = fh * 60 + fm;
  const end = th * 60 + tm;

  while (t <= end) {
    const h = String(Math.floor(t / 60)).padStart(2, "0");
    const m = String(t % 60).padStart(2, "0");
    times.value.push(`${h}:${m}`);
    t += 30;
  }
}

/* ===== Slot-Key ===== */
function slotKey(date, time) {
  return new Date(`${date}T${time}:00`).toISOString();
}

/* ===== Toggle ===== */
function toggle(date, time) {
  const key = slotKey(date, time);
  selected.value.has(key)
    ? selected.value.delete(key)
    : selected.value.add(key);
}

/* ===== Aggregation ===== */
async function reloadAggregate() {
  const rows = await getAggregate(props.eventId);
  aggregate.value = {};
  for (const r of rows) {
    aggregate.value[r.timeslot] = r;
  }
}

/* ===== Best Slots ===== */
const bestSlots = computed(() => {
  const entries = Object.entries(aggregate.value);
  if (entries.length === 0) return [];

  const max = Math.max(...entries.map(([, v]) => v.count));
  if (max === 0) return [];

  return entries
    .filter(([, v]) => v.count === max)
    .map(([slot, v]) => ({
      slot,
      count: v.count,
      names: v.names
    }));
});

function isBestSlot(slot) {
  return bestSlots.value.some(b => b.slot === slot);
}

/* ===== Submit ===== */
async function submit() {
  if (!name.value.trim()) {
    alert("Name erforderlich");
    return;
  }

  if (selected.value.size === 0) {
    alert("Bitte mindestens einen Zeitslot auswählen");
    return;
  }

  await saveAvailability(
    props.eventId,
    name.value.trim(),
    Array.from(selected.value)
  );

  selected.value.clear();
  await reloadAggregate();
}

/* ===== Init ===== */
onMounted(async () => {
  const res = await getEvent(props.eventId);
  event.value = res.event;

  if (typeof event.value.allowed_dates === "string") {
    event.value.allowed_dates = JSON.parse(event.value.allowed_dates);
  }

  buildTimes();
  await reloadAggregate();

  disconnectWS = connectLiveUpdates(props.eventId, reloadAggregate);
});

onUnmounted(() => {
  if (disconnectWS) disconnectWS();
});
</script>

<template>
  <div v-if="event" style="display:flex;gap:32px;align-items:flex-start">
    <!-- ================= GRID ================= -->
    <div>
      <input
        v-model="name"
        placeholder="Dein Name"
        style="margin-bottom:12px;padding:8px;width:200px"
      />

      <table
        class="time-grid"
        border="1"
        cellspacing="0"
        cellpadding="0"
      >
        <thead>
          <tr>
            <th class="date-col">Datum</th>
            <th
              v-for="t in times"
              :key="t"
              class="time-col"
            >
              {{ t }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="d in event.allowed_dates" :key="d">
            <td class="date-col">
              {{ d }}
            </td>

            <td
              v-for="t in times"
              :key="t"
              class="slot-cell"
              @click="toggle(d, t)"
              :title="
                aggregate[slotKey(d,t)]
                  ? aggregate[slotKey(d,t)].names.join(', ')
                  : ''
              "
              :class="{
                selected: selected.has(slotKey(d,t)),
                best: isBestSlot(slotKey(d,t)),
                filled: aggregate[slotKey(d,t)]
              }"
            ></td>
          </tr>
        </tbody>
      </table>

      <button
        style="margin-top:12px;padding:8px 14px;cursor:pointer"
        @click="submit"
      >
        Verfügbarkeit speichern
      </button>
    </div>

    <!-- ================= BEST SLOTS ================= -->
    <div style="min-width:260px">
      <h3>⭐ Beste Zeit(en)</h3>

      <div v-if="bestSlots.length === 0" style="color:#666">
        Noch keine Daten
      </div>

      <ul v-else style="padding-left:18px">
        <li
          v-for="b in bestSlots"
          :key="b.slot"
          :title="b.names.join(', ')"
          style="margin-bottom:8px"
        >
          <strong>
            {{ b.slot.slice(0,16).replace('T',' ') }}
          </strong>
          <br />
          {{ b.count }} Teilnehmer
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.time-grid {
  border-collapse: collapse;
  table-layout: fixed;
}

.date-col {
  width: 110px;
  min-width: 110px;
  text-align: left;
  padding: 6px;
  font-weight: bold;
  background: #f3f3f3;
}

.time-col {
  width: 44px;
  min-width: 44px;
  height: 32px;
  font-size: 12px;
  text-align: center;
  background: #f3f3f3;
}

.slot-cell {
  width: 44px;
  height: 32px;
  cursor: pointer;
  background: #fff;
}

.slot-cell.filled {
  background: #ddd;
}

.slot-cell.best {
  background: #ffd966;
}

.slot-cell.selected {
  background: #b6f5b6;
}
</style>
