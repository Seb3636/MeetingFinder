<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getEvent } from "../api";
import TimeGrid from "../components/TimeGrid.vue";

const route = useRoute();
const router = useRouter();

const eventId = route.params.id;   // ✅ einzig richtige Quelle
const event = ref(null);
const error = ref(null);

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    alert("Link kopiert");
  } catch (e) {
    console.error(e);
    alert("Browser blockiert Clipboard – bitte manuell kopieren");
  }
}

onMounted(async () => {
  try {
    const res = await getEvent(eventId);
    event.value = res.event;
  } catch {
    error.value = "Meeting nicht gefunden oder abgelaufen";
  }
});
</script>

<template>
  <div style="padding:30px 20px">
    <img
      src="/MeetingFinder_Banner.png"
      alt="MeetingFinder"
      style="
        width:70%;
        max-height:200px;
        object-fit:cover;
        border-radius:8px;
        margin-bottom:20px;
      "
    />
    <br />
    <button
      @click="router.push('/')"
      style="margin-bottom:20px;cursor:pointer"
    >
      ← Neues Meeting
    </button>

    <div v-if="error" style="color:red">
      {{ error }}
    </div>

    <div v-else-if="event">
      <h1>{{ event.title }}</h1>

      <p style="color:#666;font-size:14px">
        Markiere deine verfügbaren Zeiten.
      </p>

      <button
        @click="copyLink"
        style="margin-bottom:20px"
      >
        🔗 Link kopieren
      </button>

      <!-- ✅ Grid bekommt eventId -->
      <TimeGrid :eventId="eventId" />
    </div>
  </div>
</template>
