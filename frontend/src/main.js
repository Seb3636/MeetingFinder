import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import Home from "./views/Home.vue";
import EventView from "./views/EventView.vue";

console.log("WS BASE =", import.meta.env.VITE_WS_BASE);

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/event/:id", component: EventView, props: true }
  ]
});

createApp(App).use(router).mount("#app");
