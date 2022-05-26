<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { ref } from "vue";
import Main from "./components/Main.vue";
import Footer from "./components/Footer.vue";

const peerId = ref("");
const messages = ref([]);

const peer = new Peer();
const connections = ref([]);

function onReceiveData(data) {
  const messageBody = JSON.parse(data);
  messages.value.push(messageBody);
}

peer.on("open", function (id) {
  peerId.value = id;

  const peerIdMatch = location.search.match(/p=([\da-f-]*)/);
  if (peerIdMatch) {
    const peerId = peerIdMatch[1];
    const conn = peer.connect(peerId);
    conn.on("open", function () {
      conn.on("data", onReceiveData);
      connections.value.push(conn);
    });
  }
});

peer.on("connection", function (conn) {
  conn.on("data", onReceiveData);
  connections.value.push(conn);
});

function sendMessage(message) {
  const messageBody = {
    id: crypto.randomUUID(),
    type: "text",
    from: peerId.value,
    data: message,
  };
  messages.value.push(messageBody);
  for (let conn of connections.value) {
    conn.send(JSON.stringify(messageBody));
  }
}
</script>

<template>
  <div class="header color-primary" v-text="connections.length + ' ' + peerId"></div>
  <Main :messages="messages" />
  <Footer @send="sendMessage" />
</template>

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
  height: 1em;
}

.main {
  flex-grow: 1;
  overflow-y: auto;
}

.footer {
  padding: 8px 8px 0 8px;
}
</style>
