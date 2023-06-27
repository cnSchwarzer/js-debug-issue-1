import { createApp } from "vue";
import App from "./App.vue";

import PrimeVue from "primevue/config";
import Button from "primevue/button";
import ScrollPanel from "primevue/scrollpanel";

import "primevue/resources/primevue.min.css";
import "primevue/resources/themes/lara-dark-indigo/theme.css";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "./style.css";

import HelloWorldVue from "./components/HelloWorld.vue";
import Editor from "./components/Editor.vue";
import Player from "./components/Player.vue";

import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HelloWorldVue },
    { path: "/editor", component: Editor },
    { path: "/player", component: Player },
  ],
});

const app = createApp(App);
app.use(router);
app.use(PrimeVue);
app.component("Button", Button);
app.component("ScrollPanel", ScrollPanel);

app.mount("#app").$nextTick(() => {
  postMessage({ payload: "removeLoading" }, "*");
});
