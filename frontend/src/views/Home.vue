<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { createEvent } from "../api";

const router = useRouter();

/* ======================================================
   State
====================================================== */
const title = ref("");
const selectedDates = ref(new Set());
const timeFrom = ref("17:00");
const timeTo = ref("19:00");

let dragging = false;

const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
function localTodayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

const todayIso = localTodayIso();

/* ======================================================
   Monate (dynamisch erweiterbar)
====================================================== */
const months = ref([]);

function addMonth() {
  if (months.value.length === 0) {
    const now = new Date();
    months.value.push({
      year: now.getFullYear(),
      month: now.getMonth()
    });
    return;
  }

  const last = months.value[months.value.length - 1];
  const next = new Date(last.year, last.month + 1, 1);

  months.value.push({
    year: next.getFullYear(),
    month: next.getMonth()
  });
}

// Initial: aktueller Monat
addMonth();

/* ======================================================
   Kalenderberechnung
====================================================== */
function buildMonthDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const days = [];
  const startOffset = (first.getDay() + 6) % 7;

  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }

  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(year, month, d);
    const iso = date.toISOString().slice(0, 10);

    days.push({
      iso,
      day: d,
      weekday: (date.getDay() + 6) % 7,
      past: iso < todayIso
    });
  }

  return days;
}

/* ======================================================
   Auswahl
====================================================== */
function toggleDate(d) {
  if (!d || d.past) return;

  selectedDates.value.has(d.iso)
    ? selectedDates.value.delete(d.iso)
    : selectedDates.value.add(d.iso);
}

function startDrag(d) {
  if (!d || d.past) return;
  dragging = true;
  toggleDate(d);
}

function dragOver(d) {
  if (dragging && d && !d.past) {
    selectedDates.value.add(d.iso);
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
      style="width:100%;max-height:220px;object-fit:cover;border-radius:8px;margin-bottom:30px"
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
      style="display:grid;grid-template-columns:repeat(7,44px);gap:6px;margin-bottom:6px;font-weight:bold;text-align:center"
    >
      <div v-for="w in weekdayLabels" :key="w">{{ w }}</div>
    </div>

    <!-- Monate -->
    <div
      v-for="(m, idx) in months"
      :key="idx"
      style="margin-bottom:18px"
    >
      <div style="font-weight:bold;margin:6px 0">
        {{ new Date(m.year, m.month).toLocaleString("de-DE", { month: "long", year: "numeric" }) }}
      </div>

      <div
        @mouseup="stopDrag"
        @mouseleave="stopDrag"
        style="display:grid;grid-template-columns:repeat(7,44px);gap:6px"
      >
        <div
          v-for="(d, i) in buildMonthDays(m.year, m.month)"
          :key="i"
          class="day-cell"
          :class="{
            selected: d && selectedDates.has(d.iso),
            weekend: d && d.weekday >= 5,
            past: d && d.past,
            empty: !d
          }"
          @mousedown="startDrag(d)"
          @mouseover="dragOver(d)"
        >
          {{ d ? String(d.day).padStart(2, "0") : "" }}
        </div>
      </div>
    </div>

    <!-- Weiterer Monat -->
    <button
      @click="addMonth"
      style="margin-bottom:30px;padding:6px 12px;cursor:pointer"
    >
      + weiterer Monat
    </button>

    <h3>Uhrzeit</h3>

    <table>
      <tbody>
        <tr>
          <td>Nicht vor:</td>
          <td>Nicht nach:</td>
        </tr>
        <tr>
          <td><input type="time" v-model="timeFrom" /></td>
          <td><input type="time" v-model="timeTo" /></td>
        </tr>
      </tbody>
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

.day-cell.past {
  background: #ddd;
  color: #aaa;
  cursor: not-allowed;
}

.day-cell.empty {
  background: transparent;
  cursor: default;
}
</style>
