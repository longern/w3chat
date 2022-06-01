import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";

const i18n = createI18n({
  locale: navigator.language,
  fallbackLocale: "en",
});

const app = createApp(App);
app.directive("visible", {
  inserted(el, binding) {
    el.style.visibility = binding.value ? "visible" : "hidden";
  },
});
app.use(i18n);
app.mount("#app");
