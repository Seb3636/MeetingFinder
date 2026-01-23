<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { createEvent } from "../api";

const router = useRouter();

const title = ref("");
const selectedDates = ref(new Set());
const timeFrom = ref("09:00");
const timeTo = ref("17:00");

let dragging = false;

/* ======================================================
   Kalender-Logik (Monat fix, erweiterbar)
   ====================================================== */
const year = 2026;
const month = 0; // Januar (0-basiert)

const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const daysInMonth = computed(() => {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const days = [];

  // Leere Felder vor Monatsstart (Mo = 0)
  let startOffset = (first.getDay() + 6) % 7;
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }

  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(year, month, d);
    days.push({
      iso: date.toISOString().slice(0, 10),
      day: d,
      weekday: (date.getDay() + 6) % 7 // Mo=0
    });
  }

  return days;
});

/* ======================================================
   Auswahl
   ====================================================== */
function toggleDate(iso) {
  selectedDates.value.has(iso)
    ? selectedDates.value.delete(iso)
    : selectedDates.value.add(iso);
}

function startDrag(iso) {
  dragging = true;
  toggleDate(iso);
}

function dragOver(iso) {
  if (dragging && iso) {
    selectedDates.value.add(iso);
  }
}

function stopDrag() {
  dragging = false;
}

/* ======================================================
   Event erstellen
   ====================================================== */
async function create() {
  if (!title.value || selectedDates.value.size === 0) {
    alert("Titel und mindestens ein Datum auswählen");
    return;
  }

  if (timeFrom.value >= timeTo.value) {
    alert("Ungültiges Zeitfenster");
    return;
  }

  const res = await createEvent({
    title: title.value.trim(),
    allowedDates: Array.from(selectedDates.value),
    timeFrom: timeFrom.value,
    timeTo: timeTo.value
  });

  router.push(`/event/${res.id}`);
}
</script>

<template>
  <div style="padding:40px;max-width:900px">
    <!-- Banner -->
    <img
      src="/MeetingFinder_Banner.png"
      alt="MeetingFinder"
      style="
        width:100%;
        max-height:220px;
        object-fit:cover;
        border-radius:8px;
        margin-bottom:30px;
      "
    />

    <p style="color:#555;margin-bottom:20px">
      Einfache Terminfindung – ohne Accounts, ohne Tracking.
    </p>

    <input
      v-model="title"
      placeholder="Meeting-Titel"
      style="padding:8px;width:300px;margin-bottom:20px"
    />

    <h3>Welche Tage kommen in Frage?</h3>

    <!-- Wochentage -->
    <div
      style="
        display:grid;
        grid-template-columns:repeat(7,44px);
        gap:6px;
        margin-bottom:6px;
        font-weight:bold;
        text-align:center;
      "
    >
      <div v-for="w in weekdayLabels" :key="w">
        {{ w }}
      </div>
    </div>

    <!-- Kalender -->
    <div
      @mouseup="stopDrag"
      @mouseleave="stopDrag"
      style="
        display:grid;
        grid-template-columns:repeat(7,44px);
        gap:6px;
      "
    >
      <div
        v-for="(d, idx) in daysInMonth"
        :key="idx"
        :class="[
          'day-cell',
          d && selectedDates.has(d.iso) ? 'selected' : '',
          d && d.weekday >= 5 ? 'weekend' : '',
          !d ? 'empty' : ''
        ]"
        @mousedown="d && startDrag(d.iso)"
        @mouseover="d && dragOver(d.iso)"
      >
        {{ d ? String(d.day).padStart(2, "0") : "" }}
      </div>
    </div>

    <h3 style="margin-top:30px">Uhrzeit</h3>

    <table>
      <tr>
        <td>Nicht vor:</td>
        <td>Nicht nach:</td>
      </tr>
      <tr>
        <td><input type="time" v-model="timeFrom" /></td>
        <td><input type="time" v-model="timeTo" /></td>
      </tr>
    </table>

    <br />
    <button @click="create">Meeting erstellen</button>
  </div>
</template>

<style scoped>
.day-cell {
  width: 44px;
  height: 36px;
  text-align: center;
  line-height: 36px;
  cursor: pointer;
  background: #eee;
  user-select: none;
  border-radius: 4px;
  font-size: 14px;
}

.day-cell.weekend {
  background: #f5f5f5;
  color: #888;
}

.day-cell.selected {
  background: #8f8;
}

.day-cell.empty {
  background: transparent;
  cursor: default;
}
</style>
