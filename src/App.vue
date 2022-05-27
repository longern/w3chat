<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref, computed } from "vue";
import Header from "./components/Header.vue";
import Main from "./components/Main.vue";
import Footer from "./components/Footer.vue";

import { sendMessage, peer, connections, messages, blobPool } from "./composables/transmit";
</script>

<template>
  <Header
    :peer-id="peer ? peer.id : ''"
    :online="connections.length + (peer ? 1 : 0)"
  />
  <Main :messages="messages" :blobPool="blobPool" />
  <Footer :disabled="!peer" @send="sendMessage" />
</template>import NativeShare from 'nativeshare'

<style>
@import "main.css";

#app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background-color: whitesmoke;
}

.header {
  padding: 16px 0;
  text-align: center;
  height: 1.5em;
}

.main {
  flex-grow: 1;
  overflow-y: auto;
}

.footer {
  padding: 8px 8px 0 8px;
}
</style>
