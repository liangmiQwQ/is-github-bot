import "./style.css";
import "@unocss/reset/tailwind.css";
import { createApp, h } from "vue";

createApp({
  render: () => h("main", { class: "shell" }),
}).mount("#app");
