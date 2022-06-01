<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref, provide } from "vue";
import Sidebar from "./components/Sidebar.vue";
import Header from "./components/Header.vue";
import Breadcrumb from "./components/Breadcrumb.vue";
import Main from "./components/Main.vue";
import Footer from "./components/Footer.vue";
import Record from "./components/Record.vue";
import Calling from "@/components/Calling.vue";

import { sendMessage, messages } from "./composables/transmit";

const showSidebar = ref(false);
provide("showSidebar", showSidebar);
const showRecordPanel = ref(false);
provide("showRecordPanel", showRecordPanel);
const showCallingModal = ref(false);
provide("showCallingModal", showCallingModal);
</script>

<template>
  <Sidebar v-show="showSidebar" />

  <Header />
  <Breadcrumb />
  <Main :messages="messages" />
  <Footer @send="sendMessage" />
  <KeepAlive>
    <Record v-if="showRecordPanel" @record="sendMessage" />
  </KeepAlive>

  <Teleport to="body">
    <Calling v-model="showCallingModal" />
  </Teleport>
</template>

<style>
@import "main.css";

html,
body,
#app {
  width: 100%;
  height: 100%;
}

#app {
  display: flex;
  flex-direction: column;
  background-color: whitesmoke;
}

#app > * {
  flex-shrink: 0;
}

#app > .main {
  flex-shrink: 1;
}

.main {
  flex-grow: 1;
  overflow-y: auto;
}

.footer {
  padding: 8px 8px 0 8px;
}
</style>
